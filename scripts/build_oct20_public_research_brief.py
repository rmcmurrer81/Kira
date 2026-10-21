#!/usr/bin/env python3
"""Public, scoped October 20 Kira Labs evidence briefing.
This is a NEW public summary, not a substitute for the original university PDFs.
Uses visible, captured renders. Data copied from dated internal source records.
"""
from pathlib import Path
from reportlab.platypus import SimpleDocTemplate,Paragraph,Spacer,Table,TableStyle,PageBreak,Image,KeepTogether
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet,ParagraphStyle
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.units import mm
import os

root=Path("docs")
out=root/"reports"/"kira-labs-research-evidence-2026-10-20.pdf"
out.parent.mkdir(exist_ok=True,parents=True)
src="/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
bold="/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
if os.path.isfile(src) and os.path.isfile(bold):
    pdfmetrics.registerFont(TTFont("KL",src))
    pdfmetrics.registerFont(TTFont("KL-Bold",bold))
    normal,boldname="KL","KL-Bold"
else:
    normal,boldname="Helvetica","Helvetica-Bold"

NAVY=colors.HexColor("#071725");CYAN=colors.HexColor("#087c8c");INK=colors.HexColor("#203547")
styles=getSampleStyleSheet()
styles.add(ParagraphStyle(name="HeroKL",fontName=boldname,fontSize=23,leading=28,textColor=NAVY,spaceAfter=12))
styles.add(ParagraphStyle(name="SubKL",fontName=normal,fontSize=10,leading=15,textColor=INK,spaceAfter=11))
styles.add(ParagraphStyle(name="HeadKL",fontName=boldname,fontSize=15,leading=19,textColor=NAVY,spaceBefore=12,spaceAfter=8))
styles.add(ParagraphStyle(name="TinyKL",fontName=normal,fontSize=8,leading=12,textColor=INK,spaceAfter=7))
styles.add(ParagraphStyle(name="CellKL",fontName=normal,fontSize=8,leading=12,textColor=INK))
styles.add(ParagraphStyle(name="CellBoldKL",fontName=boldname,fontSize=8,leading=12,textColor=NAVY))
styles.add(ParagraphStyle(name="CreditKL",fontName=normal,fontSize=8,leading=13,textColor=INK,spaceBefore=5,spaceAfter=11))
P=lambda s,style="SubKL":Paragraph(s,styles[style])
doc=SimpleDocTemplate(str(out),pagesize=A4,rightMargin=40,leftMargin=40,topMargin=57,bottomMargin=50,
 title="Kira Labs - Research evidence and limits - 20 October 2026",
 author="Kira Labs",subject="Public summary of internally measured engineering and learning tests")
width=A4[0]-80
story=[]
story.extend([P("KIRA LABS  |  PUBLIC RESEARCH EVIDENCE", "TinyKL"),P("Measured results.<br/>Visible evidence. Clear limits.","HeroKL"),
P("20 October 2026. This publication summarizes selected internal engineering results, preserved negative tests, and an early compatibility head-render preview. It does not establish external replication, generalized intelligence, clinical efficacy, or a released Evelyn assistant."),
P("NewBrain: different tests, different conclusions","HeadKL")])
columns=[
("Study","Recorded result","What it actually establishes"),
("Original12 after 256 updates","2/12 to 2/12","Two gained passes offset two losses; no net improvement."),
("Short conditional teaching","2/3 to 3/3 to 3/3","Three rehearsed answers correct after training and independent-process reload; generalization untested."),
("Longer complete answers","2/3 to 2/3","The first content token improved, but source/version tokens were omitted after an early end marker."),
("Five-question pilot","2/5 to 0/5 to 0/5","Regression after training, preserved after reload; no acquisition claim."),
("Numerical derivative check","80/80 and 4/4","Sampled coordinate and directional checks passed; not evidence of better learned answers."),
("One-step weight update","11,914 / 11,914","Saved parameter values matched one expected update; zero bit mismatches.")
]
table=Table([[P(cell,"CellBoldKL" if i==0 or j==0 else "CellKL") for j,cell in enumerate(row)] for i,row in enumerate(columns)],
            colWidths=[125,113,width-238],repeatRows=1,hAlign="LEFT")
table.setStyle(TableStyle([
 ("BACKGROUND",(0,0),(-1,0),colors.HexColor("#d7f0f4")),
 ("ROWBACKGROUNDS",(0,1),(-1,-1),[colors.white,colors.HexColor("#f3f8fb")]),
 ("LINEBELOW",(0,0),(-1,-1),.3,colors.HexColor("#c7d8df")),
 ("VALIGN",(0,0),(-1,-1),"TOP"),
 ("LEFTPADDING",(0,0),(-1,-1),8),("RIGHTPADDING",(0,0),(-1,-1),7),
 ("TOPPADDING",(0,0),(-1,-1),8),("BOTTOMPADDING",(0,0),(-1,-1),8)
]))
story+=[table,Spacer(1,9),P("<b>Interpretation:</b> A correct sampled numerical check, a precisely matching one-step update, and a three-question taught-answer success are distinct findings. None overrides the unchanged Original12 benchmark or the separate unsuccessful longer and five-question tests.","TinyKL")]
story.append(PageBreak())
story.extend([P("EVELYN HART  |  ACTUAL CAPTURED RESULTS","TinyKL"),
 P("Three visible head views.","HeroKL"),
 P("These are crops of screenshots from the recorded compatibility rendering test, not promotional concept art and not AI-generated substitute portraits. The images use an existing licensed head candidate with modified diffuse materials and reduced textures.")])
cards=[]
for label,title in (("front","Front"),("three-quarter","Three-quarter"),("side","Side")):
    path=root/"assets"/f"evelyn-head-{label}-capture-20261020.webp"
    if not path.exists():raise RuntimeError("Missing actual captured render "+str(path))
    img=Image(str(path),width=161,height=165)
    cards.append([img,P(title,"CellBoldKL")])
gallery=Table([[card[0] for card in cards],[card[1] for card in cards]],colWidths=[width/3]*3,hAlign="LEFT")
gallery.setStyle(TableStyle([("VALIGN",(0,0),(-1,-1),"TOP"),("LEFTPADDING",(0,0),(-1,-1),4),("RIGHTPADDING",(0,0),(-1,-1),4),("BOTTOMPADDING",(0,0),(-1,-1),5)]))
story+=[gallery,Spacer(1,10),
 P("<b>What the review supports:</b> Saved front, three-quarter, and side views were visibly nonblank, showed the face and eyes, differed by camera angle, and were reported as matching direct canvas captures. The earlier blank and graphics-failure records were preserved."),
 P("<b>What remains unverified:</b> Blinking, generated speech, mouth movement, lip synchronization, joined voice-and-avatar operation, visitor-memory restart, original PBR material fidelity, and a publicly installable Evelyn release."),
 P("<b>Attribution:</b> Base Female Character by BlackProject (CC BY 4.0). The compatibility presentation uses modified materials, reduced textures, and cropped renderer screenshots. License: https://creativecommons.org/licenses/by/4.0/","CreditKL"),
 P("Evelyn also has a separate educational reference library prepared with 52 historical cards and 51 source entries. That reference collection is not proof of generated conversational accuracy or memory persistence."),
 P("For the original screenshot context, including the modified-material compatibility notice, see https://kiralabs.org/evidence.html#evelyn-captures.","TinyKL")]
story.append(PageBreak())
story.extend([P("RESEARCH METHODS  |  PUBLIC DISCLOSURES","TinyKL"),P("What the reports actually cover.","HeroKL"),
 P("NewBrain methods and limitations","HeadKL"),
 P("<b>Numerical-gradient test:</b> a frozen two-probe method passed 80 coordinate and four direction comparisons, rejecting two deliberately wrong-gradient controls. All ten parameter groups met the predeclared signal requirement. Maximum absolute comparison error was about 2.08e-9. No training or generated-answer assessment occurred in that diagnostic."),
 P("<b>Single-step training check:</b> a separately reviewed update matched 11,914 of 11,914 expected parameter values and rejected three incorrect arithmetic controls. This evaluates the selected numerical step, not whether a new unfamiliar fact was learned."),
 P("<b>Later learning behavior:</b> the verified short 3/3 restart involved three explicitly rehearsed synthetic examples; longer output stayed at 2/3 because the model ended after the first correct token rather than giving the required source and version. The separate five-question study fell from 2/5 to 0/5. Main Original12 stayed 2/12."),
 P("Patient Horizon and Avatar Builder","HeadKL"),
 P("A proposed lung demonstration would connect versioned synthetic observations to an anatomical view and separately verified physiology. Recorded software checks include four synthetic request-planner checks and a body engineering result in which 512 weighted skin vertices moved through five commanded poses and returned to reference positions. They do not establish physiological lung simulation, clinical treatment prediction, or hospital integration."),
 P("Read the downloadable source reports","HeadKL"),
 P("Archived original PDF - Measured Skin Movement and Restoration: https://kiralabs.org/reports/2026-10-measured-skin-movement-and-restoration.pdf","TinyKL"),
 P("Archived original PDF - How Our Tests Work and What the Results Mean: https://kiralabs.org/reports/2026-10-test-methods-and-results-explained.pdf","TinyKL"),
 P("NewBrain current experiment summaries: https://kiralabs.org/newbrain.html#newbrain-longer-answer-2026-10-20","TinyKL"),
 P("Evelyn evidence gallery and original captures: https://kiralabs.org/evidence.html#evelyn-captures","TinyKL"),
 P("<b>Document scope:</b> Kira Labs internal source reports and development screenshots; not peer-reviewed replication. NewBrain Original12 and Qwen comparisons are not represented as improved. Rendered compatibility head assets are not voice or conversation demonstrations.","CreditKL")])

def draw_page(canvas,doc):
    canvas.saveState()
    canvas.setFillColor(NAVY)
    canvas.rect(0,A4[1]-35,A4[0],35,stroke=0,fill=1)
    canvas.setFillColor(colors.white)
    canvas.setFont(boldname,9)
    canvas.drawString(40,A4[1]-23,"KIRA LABS  /  INDEPENDENT AI RESEARCH")
    canvas.setStrokeColor(CYAN)
    canvas.line(40,39,A4[0]-40,39)
    canvas.setFillColor(INK);canvas.setFont(normal,8)
    canvas.drawString(40,28,"Public evidence briefing  |  20 October 2026")
    canvas.drawRightString(A4[0]-40,28,f"{doc.page}")
    canvas.restoreState()

doc.build(story,onFirstPage=draw_page,onLaterPages=draw_page)
print("Generated public current research briefing:",out,"bytes",out.stat().st_size)
