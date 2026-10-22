import type { StudioState } from "../shared/product";
export interface Snapshot {
  state: StudioState;
  manual: string | null;
}
export interface History {
  past: Snapshot[];
  present: Snapshot;
  future: Snapshot[];
}
export type HistoryAction =
  | { type: "replace"; value: Snapshot }
  | { type: "change"; value: Snapshot }
  | { type: "undo" }
  | { type: "redo" };
export function historyReducer(
  history: History,
  action: HistoryAction,
): History {
  if (action.type === "replace")
    return { past: [], present: action.value, future: [] };
  if (action.type === "change")
    return {
      past: [...history.past, history.present].slice(-50),
      present: action.value,
      future: [],
    };
  if (action.type === "undo" && history.past.length)
    return {
      past: history.past.slice(0, -1),
      present: history.past.at(-1)!,
      future: [history.present, ...history.future],
    };
  if (action.type === "redo" && history.future.length)
    return {
      past: [...history.past, history.present],
      present: history.future[0],
      future: history.future.slice(1),
    };
  return history;
}
