import type { Message } from "#shared/types/ws/message";
import { onJoinRequestResponse } from "~/composables/messages/joinRequestResponse";
import { onPlayerJoin } from "~/composables/messages/playerJoin";
import { onNewOwner } from "~/composables/messages/newOwner";
import { onCardDeal } from "~/composables/messages/cardDeal";
import { onGameStateUpdate } from "~/composables/messages/gameStateUpdate";
import { onPlayerTurn } from "~/composables/messages/playerTurn";
import { onPlayerAction } from "~/composables/messages/playerAction";

export const useGameWebSocket = () => {
  const socket = useState<WebSocket | null>('gameWebSocket', () => null)
  if (!socket.value) {
    connectToGameWebSocket(socket)
  } else if (socket.value.readyState === WebSocket.CLOSED) {
    connectToGameWebSocket(socket)
  }
  return socket
}
export type MessageHandler<K extends Message['type']> = (message: Extract<Message, { type: K }>) => Promise<void>;

export type JokerHandler = (fromPlayer: PlayerId, toPlayer: PlayerId, handIndex: number) => Promise<void>;

const messageHandlers: Partial<{ [K in Message['type']]: MessageHandler<K> }> = {
  'player-join-request-response': onJoinRequestResponse,
  'player-join': onPlayerJoin,
  'new-game-owner': onNewOwner,
  'deal-card': onCardDeal,
  'game-state-update': onGameStateUpdate,
  'player-turn': onPlayerTurn,
  "player-action": onPlayerAction
}

const onMessage = async (message: Message) => {
  const handler = messageHandlers[message.type] as MessageHandler<Message['type']> | undefined;
  if (handler) {
    await handler(message);
  }
}

export const sendMessage = (message: Message) => {
  const socket = useGameWebSocket()
  if (socket.value && socket.value.readyState === WebSocket.OPEN) {
    socket.value.send(JSON.stringify(message))
  } else {
    console.warn('WebSocket is not open. Cannot send message:', message)
  }
}

export const connectToGameWebSocket = (socket?: Ref<WebSocket | null>) => {
  const gameWebSocket = socket ? socket : useGameWebSocket()

  if (gameWebSocket.value) {
    console.warn('WebSocket is already connected')
    return
  }

  const ws = new WebSocket(`${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/ws/game`)

  ws.onopen = () => {
    console.log('WebSocket connection established')
  }

  ws.onmessage = (e: MessageEvent) => {
    const message = JSON.parse(e.data) as Message;
    onMessage(message).then()
  }

  gameWebSocket.value = ws
}
