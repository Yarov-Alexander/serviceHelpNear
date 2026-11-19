import { useSyncExternalStore } from "react";

/**
 * Мини-стор для модальных окон кабинета.
 * Без зависимостей: любой компонент (шапка, подвал, карточка) вызывает
 * openModal('messages' | 'profile'), а сами окна подписаны через useModal().
 */
interface ModalPayloads {
  messages: { conversationId?: string };
  profile: { tab?: "info" | "security" };
}

export type ModalName = keyof ModalPayloads;

interface ModalState {
  name: ModalName | null;
  payload: ModalPayloads[ModalName] | null;
}

const CLOSED: ModalState = { name: null, payload: null };

let state: ModalState = CLOSED;
const listeners = new Set<() => void>();

function emit(): void {
  listeners.forEach((listener) => listener());
}

export function subscribeModal(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getModalState(): ModalState {
  return state;
}

export function openModal<K extends ModalName>(
  name: K,
  payload: ModalPayloads[K] = {} as ModalPayloads[K],
): void {
  state = { name, payload };
  emit();
}

export function closeModal(): void {
  if (state.name === null) return;
  state = CLOSED;
  emit();
}

export function useModal<K extends ModalName>(name: K) {
  const current = useSyncExternalStore(subscribeModal, getModalState, getModalState);
  const isOpen = current.name === name;

  return {
    isOpen,
    payload: (isOpen ? current.payload : null) as ModalPayloads[K] | null,
    close: closeModal,
  };
}
