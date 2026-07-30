"""
AI Interview Behavior Analyzer — Phase 4
Entry point only. All engine logic lives in engine.py and the
modules it composes (camera, detector, scoring, tracker, reports,
ui, lifecycle). Running this script behaves identically to the
original monolithic main.py: [S] start, [E] end + report, [Q] quit.
"""

from engine import BehaviorEngine


def main():
    engine = BehaviorEngine()
    engine.run()


if __name__ == "__main__":
    main()
