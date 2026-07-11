import { useEffect } from "react";
import { useToast } from "./ToastContext";
import { mockToasts } from "../../data/mockToasts";

// Cosmetic/demo-flavor only -- cycles mock messages on an interval.
// Explicitly NOT wired to any real ingestion/brief event; the real
// "Interaction added" toast is pushed separately from
// NewInteractionForm via the same useToast() hook, so nobody confuses
// this loop with an actual event stream.
export function LiveToastFeed() {
  const { pushToast } = useToast();

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      pushToast(mockToasts[index % mockToasts.length]);
      index += 1;
    }, 6000);
    return () => clearInterval(interval);
  }, [pushToast]);

  return null;
}
