import {EventData} from "@/core/types";


interface ListenParams<T> {
  getFn: () => Promise<EventData<T>[]>;
  waitFn: (listener: (e: EventData<T>) => void) => (() => void) | undefined;
  onListen: (e: EventData<T>) => void;
}

export async function listenEvent<T>({
  getFn,
  waitFn,
  onListen,
}: ListenParams<T>) {
  const events = await getFn();
  if (events.length > 0) {
    onListen(events[0]);
    return;
  }
  console.log('watching event');
  const unwatch = waitFn((e) => {
    console.log('unwatching event');
    onListen(e);
    if (unwatch) {
      unwatch();
    }
  });
  setTimeout(() => {
    console.log('unwatching event');
    if (unwatch) {
      unwatch();
    }
  }, 5000);
}
