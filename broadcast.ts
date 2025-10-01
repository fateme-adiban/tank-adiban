export type UpdateMessage = {
  type: "COUNT_UPDATE"
  value: number
}

export const channel = new BroadcastChannel("app-sync")

export const sendUpdate = (data: UpdateMessage) => {
  channel.postMessage(data)
}

export const onUpdate = (callback: (data: UpdateMessage) => void) => {
  channel.onmessage = (event) => callback(event.data)
}
