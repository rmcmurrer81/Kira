/* Code Quest teaching-language interpreter.
 * Player text is parsed as a small JavaScript subset, never evaluated by the JS
 * engine. Values are primitives/lists; names only resolve in our own Maps. There
 * is no member access, host global lookup, dynamic code, or network instruction.
 * A disposable worker and the page timeout are additional responsiveness guards.
 */
(() => {
  "use strict";
  const LIMITS = Object.freeze({ input: 6000, tokens: 2000, nodes: 1400, depth: 40, steps: 10000, loops: 1000, actions: 64 });
  const COMMANDS = new Set(["say", "charge", "move", "turn", "openGate", "collect"]);
  class QuestError extends Error {}
  const fail = message => { throw new QuestError(message); };

  function tokenize(code) {
    const tokens = []; let i = 0, line = 1;
    const add = (kind, value, atLine = line) => {
      if (tokens.length >= LIMITS.tokens) fail("This program has too many pieces. Try a smaller program.");
      tokens.push({ kind, value, line: atLine });
    };
    while (i < code.length) {
      const c = code[i];
      if (/\s/.test(c)) { if (c === "\n") line++; i++; continue; }
      if (code.startsWith("//", i)) { while (i < code.length && code[i] !== "\n") i++; continue; }
      if (code.startsWith("/*", i)) {
        i += 2; const end = code.indexOf("*/", i);
        if (end < 0) fail("A comment needs its closing */.");
        line += (code.slice(i, end).match(/\n/g) || []).length; i = end + 2; continue;
      }
      if (c === '"' || c === "'") {
        const quote = c, atLine = line; let value = "", closed = false; i++;
        while (i < code.length) {
          const ch = code[i++];
          if (ch === quote) { closed = true; break; }
          if (ch === "\n" || ch === "\r") fail("Keep a message on one line and close its quotation marks.");
          if (ch === "\\") {
            if (i >= code.length) fail("Close the quotation marks around your message.");
            const escaped = code[i++], escapes = { n: "\n", r: "\r", t: "\t", "\\": "\\", "'": "'", '"': '"' };
            if (!Object.hasOwn(escapes, escaped)) fail("Use ordinary text inside quotes. This adventure supports simple text escapes only.");
            value += escapes[escaped];
          } else value += ch;
          if (value.length > 500) fail("That message is too long. Keep each string under 500 characters.");
        }
        if (!closed) fail("Close the quotation marks around your message.");
        add("string", value, atLine); continue;
      }
      if (/[0-9]/.test(c)) {
        const match = code.slice(i).match(/^\d+(?:\.\d+)?/)[0];
        const value = Number(match); if (!Number.isFinite(value) || value > 1000000) fail("Use numbers no larger than one million.");
        add("number", value); i += match.length; continue;
      }
      if (/[A-Za-z_$]/.test(c)) {
        const word = code.slice(i).match(/^[A-Za-z_$][A-Za-z0-9_$]*/)[0];
        add("name", word); i += word.length; continue;
      }
      const operator = ["===", "!==", ">=", "<=", "==", "!=", "&&", "||", "++", "--", "+=", "-="].find(op => code.startsWith(op, i));
      if (operator) { add("symbol", operator); i += operator.length; continue; }
      if ("(){}[];,+-*/%><=!:".includes(c)) { add("symbol", c); i++; continue; }
      fail("Line " + line + ": “" + c + "” is outside this adventure's small JavaScript subset. Use the commands shown in your lesson.");
    }
    add("end", "<end>"); return tokens;
  }

  class Parser {
    constructor(tokens) { this.tokens = tokens; this.i = 0; this.depth = 0; this.nodes = 0; }
    peek(value) { const token = this.tokens[this.i]; return token.kind !== "string" && token.kind !== "number" && token.value === value; }
    take(value) { if (!this.peek(value)) this.error("Expected “" + value + "”."); return this.tokens[this.i++]; }
    accept(value) { if (!this.peek(value)) return false; this.i++; return true; }
    error(message) { fail("Line " + this.tokens[this.i].line + ": " + message); }
    node(type, fields = {}) { if (++this.nodes > LIMITS.nodes) this.error("This program is too complex. Try fewer instructions."); return { type, ...fields }; }
    nested(fn) { if (++this.depth > LIMITS.depth) this.error("There are too many nested brackets or calls. Simplify the program."); try { return fn(); } finally { this.depth--; } }
    name() {
      const token = this.tokens[this.i];
      if (token.kind !== "name" || ["let", "const", "if", "else", "for", "of", "while", "function", "return", "true", "false", "null", "delete", "new", "this", "class", "import", "export", "try", "throw", "var"].includes(token.value)) this.error("Choose a variable or function name here.");
      this.i++; return token.value;
    }
    semi() { if (!this.accept(";") && !this.peek("}") && !this.peek("<end>")) this.error("Add a semicolon ; after this instruction."); }
    program() { const body = []; while (!this.peek("<end>")) body.push(this.statement()); return body; }
    block() {
      this.take("{"); const body = [];
      while (!this.peek("}")) { if (this.peek("<end>")) this.error("Close this group with }."); body.push(this.statement()); }
      this.take("}"); return body;
    }
    declaration() {
      const constant = this.accept("const"); if (!constant) this.take("let");
      const name = this.name(); this.take("="); const value = this.expression();
      return this.node("declare", { name, constant, value });
    }
    statement() { return this.nested(() => {
      if (this.accept(";")) return this.node("empty");
      if (this.peek("{")) return this.node("block", { body: this.block() });
      if (this.peek("let") || this.peek("const")) { const d = this.declaration(); this.semi(); return d; }
      if (this.accept("if")) {
        this.take("("); const condition = this.expression(); this.take(")");
        const yes = this.statement(), no = this.accept("else") ? this.statement() : null;
        return this.node("if", { condition, yes, no });
      }
      if (this.accept("while")) {
        this.take("("); const condition = this.expression(); this.take(")");
        return this.node("while", { condition, body: this.statement() });
      }
      if (this.accept("for")) {
        this.take("("); const checkpoint = this.i;
        if (this.peek("let") || this.peek("const")) {
          const constant = this.accept("const"); if (!constant) this.take("let"); const name = this.name();
          if (this.accept("of")) {
            const list = this.expression(); this.take(")");
            return this.node("forOf", { name, constant, list, body: this.statement() });
          }
          this.i = checkpoint;
        }
        const init = this.peek("let") || this.peek("const") ? this.declaration() : this.assignment(); this.take(";");
        const condition = this.expression(); this.take(";"); const update = this.assignment(); this.take(")");
        return this.node("for", { init, condition, update, body: this.statement() });
      }
      if (this.accept("function")) {
        const name = this.name(); this.take("("); const params = [];
        if (!this.peek(")")) do { params.push(this.name()); if (params.length > 8) this.error("Use at most eight function inputs."); } while (this.accept(","));
        this.take(")"); if (new Set(params).size !== params.length) this.error("Give every function input its own name.");
        return this.node("function", { name, params, body: this.block() });
      }
      if (this.accept("return")) { const value = this.peek(";") || this.peek("}") ? this.node("literal", { value: null }) : this.expression(); this.semi(); return this.node("return", { value }); }
      const result = this.assignment(); this.semi(); return result;
    }); }
    assignment() {
      if (this.tokens[this.i].kind === "name" && this.tokens[this.i + 1]?.kind === "symbol" && ["=", "+=", "-=", "++", "--"].includes(this.tokens[this.i + 1]?.value)) {
        const name = this.name(), operator = this.tokens[this.i++].value;
        const value = operator === "++" || operator === "--" ? this.node("literal", { value: 1 }) : this.expression();
        return this.node("assign", { name, operator, value });
      }
      return this.node("expression", { value: this.expression() });
    }
    expression(minimum = 0) { return this.nested(() => {
      const precedence = { "||": 1, "&&": 2, "===": 3, "!==": 3, "==": 3, "!=": 3, ">": 4, "<": 4, ">=": 4, "<=": 4, "+": 5, "-": 5, "*": 6, "/": 6, "%": 6 };
      let left = this.primary();
      while ((this.tokens[this.i].kind === "symbol" && Object.hasOwn(precedence, this.tokens[this.i].value) ? precedence[this.tokens[this.i].value] : 0) > minimum) {
        const operator = this.tokens[this.i++].value, right = this.expression(precedence[operator]);
        left = this.node("binary", { operator, left, right });
      }
      return left;
    }); }
    primary() { return this.nested(() => {
      const token = this.tokens[this.i];
      if (token.kind === "symbol" && ["!", "-", "+"].includes(token.value)) { this.i++; return this.node("unary", { operator: token.value, value: this.primary() }); }
      if (this.accept("(")) { const value = this.expression(); this.take(")"); return value; }
      if (this.accept("[")) {
        const values = [];
        if (!this.peek("]")) do { values.push(this.expression()); if (values.length > 32) this.error("Keep each list to 32 items or fewer."); } while (this.accept(",") && !this.peek("]"));
        this.take("]"); return this.node("array", { values });
      }
      if (token.kind === "string" || token.kind === "number") { this.i++; return this.node("literal", { value: token.value }); }
      if (["true", "false", "null"].includes(token.value)) { this.i++; return this.node("literal", { value: token.value === "null" ? null : token.value === "true" }); }
      const name = this.name();
      if (this.accept("(")) {
        const args = []; if (!this.peek(")")) do { args.push(this.expression()); if (args.length > 8) this.error("Use at most eight inputs in a call."); } while (this.accept(","));
        this.take(")"); return this.node("call", { name, args });
      }
      return this.node("name", { name });
    }); }
  }

  class Scope {
    constructor(parent = null) { this.parent = parent; this.values = new Map(); this.functions = new Map(); }
    declare(name, value, constant) {
      if (COMMANDS.has(name)) fail("“" + name + "” is a lesson command. Choose a different variable name.");
      if (this.values.has(name) || this.functions.has(name)) fail("“" + name + "” already has a value here. Use a different name.");
      this.values.set(name, { value, constant });
    }
    binding(name) { if (this.values.has(name)) return this.values.get(name); if (this.parent) return this.parent.binding(name); fail("“" + name + "” is not defined. Create it with let or const first. Only lesson commands are available here."); }
    function(name) { if (this.values.has(name)) fail("“" + name + "” is a value, not a function. Choose a function name before ()."); return this.functions.get(name) || this.parent?.function(name); }
    defineFunction(node) {
      if (COMMANDS.has(node.name)) fail("“" + node.name + "” is a lesson command. Choose a different function name.");
      if (this.values.has(node.name) || this.functions.has(node.name)) fail("That function name is already used here.");
      this.functions.set(node.name, { ...node, scope: this });
    }
  }
  class Interpreter {
    constructor() { this.steps = 0; this.loops = 0; this.depth = 0; this.actions = []; this.features = new Set(); }
    tick() { if (++this.steps > LIMITS.steps) fail("PIX paused after too much work. Check that your loop stops, or shorten your program."); }
    bounded(value) {
      if (typeof value === "number" && (!Number.isFinite(value) || Math.abs(value) > 1000000)) fail("That calculation grew too large or divided by zero. Use smaller numbers.");
      if (typeof value === "string" && value.length > 500) fail("That message grew too long. Use a shorter string.");
      return value;
    }
    numeric(value) { if (typeof value !== "number") fail("This calculation needs a number. Check your variable's value."); return value; }
    binary(operator, left, right) {
      if (["===", "=="].includes(operator)) return left === right;
      if (["!==", "!="].includes(operator)) return left !== right;
      if (operator === "+" && typeof left === "string" && typeof right === "string") return this.bounded(left + right);
      this.numeric(left); this.numeric(right);
      if (["+", "-", "*", "/", "%"].includes(operator)) this.features.add("arithmetic");
      switch (operator) {
        case "+": return this.bounded(left + right); case "-": return this.bounded(left - right); case "*": return this.bounded(left * right);
        case "/": return this.bounded(left / right); case "%": return this.bounded(left % right);
        case ">": return left > right; case "<": return left < right; case ">=": return left >= right; case "<=": return left <= right;
        default: fail("This operator is not available in this lesson.");
      }
    }
    value(node, scope) {
      this.tick();
      if (++this.depth > LIMITS.depth) fail("There are too many nested calls. Make sure your function stops calling itself.");
      try {
        switch (node.type) {
          case "literal": if (typeof node.value === "string") this.features.add("strings"); if (typeof node.value === "number") this.features.add("numbers"); return node.value;
          case "name": return scope.binding(node.name).value;
          case "array": this.features.add("arrays"); return node.values.map(item => this.value(item, scope));
          case "unary": { const value = this.value(node.value, scope); return node.operator === "!" ? !value : this.bounded((node.operator === "-" ? -1 : 1) * this.numeric(value)); }
          case "binary": {
            const left = this.value(node.left, scope);
            if (node.operator === "&&") return left && this.value(node.right, scope);
            if (node.operator === "||") return left || this.value(node.right, scope);
            return this.binary(node.operator, left, this.value(node.right, scope));
          }
          case "call": return this.call(node.name, node.args.map(arg => this.value(arg, scope)), scope);
          default: fail("This expression is not part of the lesson language.");
        }
      } finally { this.depth--; }
    }
    log(type, value) { if (this.actions.length >= LIMITS.actions) fail("PIX received too many commands. Keep your program to 64 actions or fewer."); this.actions.push({ type, value }); return null; }
    call(name, args, scope) {
      const arity = count => { if (args.length !== count) fail(name + "() needs " + count + " input" + (count === 1 ? "" : "s") + "."); };
      const value = args[0];
      switch (name) {
        case "say": arity(1); if (typeof value !== "string" || value.length > 150) fail('say() needs a short message in quotes, like say("Hello, PIX!");'); return this.log(name, value);
        case "charge": arity(1); if (typeof value !== "number" || value < 0 || value > 100) fail("charge() needs a number between 0 and 100."); return this.log(name, value);
        case "move": arity(1); if (!Number.isInteger(value) || value < 1 || value > 20) fail("move() needs a whole number of steps from 1 to 20."); return this.log(name, value);
        case "turn": arity(1); if (value !== "left" && value !== "right") fail('turn() needs "left" or "right" inside quotation marks.'); return this.log(name, value);
        case "openGate": arity(0); return this.log(name, null);
        case "collect": arity(1); if (!Number.isInteger(value) || value < 1 || value > 20) fail("collect() needs a star number between 1 and 20."); return this.log(name, value);
        default: {
          const fn = scope.function(name); if (!fn) fail("“" + name + "” is not a lesson command or a function you have created.");
          this.features.add("functions"); arity(fn.params.length); if (fn.params.length) this.features.add("parameters"); const local = new Scope(fn.scope);
          fn.params.forEach((param, i) => local.declare(param, args[i], false));
          const result = this.body(fn.body, local); return result?.returned ? result.value : null;
        }
      }
    }
    body(nodes, scope) { for (const node of nodes) { const result = this.statement(node, scope); if (result?.returned) return result; } return null; }
    loop() { this.tick(); if (++this.loops > LIMITS.loops) fail("PIX paused a loop after 1,000 turns. Check its stop condition."); }
    statement(node, scope) {
      this.tick();
      switch (node.type) {
        case "empty": return null;
        case "block": return this.body(node.body, new Scope(scope));
        case "declare": this.features.add("variables"); scope.declare(node.name, this.value(node.value, scope), node.constant); return null;
        case "assign": {
          const binding = scope.binding(node.name); if (binding.constant) fail("“" + node.name + "” was made with const and cannot change. Use let for a changing value.");
          const next = this.value(node.value, scope);
          binding.value = node.operator === "=" ? next : this.binary(node.operator === "++" || node.operator === "+=" ? "+" : "-", binding.value, next); return null;
        }
        case "expression": this.value(node.value, scope); return null;
        case "if": {
          this.features.add("if"); if (this.value(node.condition, scope)) return this.statement(node.yes, scope);
          if (node.no) { this.features.add("else"); return this.statement(node.no, scope); } return null;
        }
        case "while": while (this.value(node.condition, scope)) { this.features.add("while"); this.loop(); const result = this.statement(node.body, scope); if (result?.returned) return result; } return null;
        case "for": {
          const local = new Scope(scope); this.statement(node.init, local);
          while (this.value(node.condition, local)) { this.features.add("for"); this.loop(); const result = this.statement(node.body, local); if (result?.returned) return result; this.statement(node.update, local); } return null;
        }
        case "forOf": {
          const list = this.value(node.list, scope); if (!Array.isArray(list)) fail("A for...of loop needs a list inside square brackets.");
          for (const value of list) { this.features.add("forOf"); this.features.add("variables"); this.loop(); const local = new Scope(scope); local.declare(node.name, value, node.constant); const result = this.statement(node.body, local); if (result?.returned) return result; } return null;
        }
        case "function": scope.defineFunction(node); return null;
        case "return": return { returned: true, value: this.value(node.value, scope) };
        default: fail("This instruction is not part of the lesson language.");
      }
    }
  }

  function runTeachingProgram(code) {
    try {
      if (typeof code !== "string" || code.length > LIMITS.input) fail("Please enter a program under 6,000 characters.");
      const parser = new Parser(tokenize(code)), ast = parser.program(), interpreter = new Interpreter();
      const result = interpreter.body(ast, new Scope()); if (result?.returned) fail("Use return only inside a function.");
      return { ok: true, actions: interpreter.actions, features: [...interpreter.features] };
    } catch (error) {
      return { ok: false, error: error instanceof QuestError ? error.message : "PIX could not read that program. Try a smaller change or ask for a hint." };
    }
  }
  if (typeof module === "object" && module.exports) module.exports = { runTeachingProgram, LIMITS };
  if (typeof self === "object" && typeof self.postMessage === "function") {
    self.onmessage = event => self.postMessage(runTeachingProgram(event.data?.code));
  }
})();
