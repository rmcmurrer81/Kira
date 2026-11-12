import json

from incubator_core import demo_suite


if __name__ == "__main__":
    print(json.dumps(demo_suite(), indent=2, ensure_ascii=False))
