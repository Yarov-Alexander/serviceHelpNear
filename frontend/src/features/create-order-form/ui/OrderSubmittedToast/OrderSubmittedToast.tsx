import "./OrderSubmittedToast.scss";

type OrderSubmittedToastProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function OrderSubmittedToast({ isOpen, onClose }: OrderSubmittedToastProps) {
  if (!isOpen) return null;

  return (
    <div className="order-submitted-toast" role="status">
      <strong>Задача готова к публикации</strong>
      <span>Бэкенд подключим позже, а форма уже не пропускает ерунду.</span>
      <button type="button" aria-label="Закрыть уведомление" onClick={onClose}>
        ×
      </button>
    </div>
  );
}