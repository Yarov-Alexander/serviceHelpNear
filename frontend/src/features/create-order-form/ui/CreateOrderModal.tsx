import type { CreateOrderInput } from "@/entities/order";
import { Modal } from "@/shared/ui/Modal";
import { CreateOrderForm, type CreateOrderValues } from "./CreateOrderForm";

interface CreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (order: CreateOrderInput) => Promise<void>;
}

export function CreateOrderModal({ isOpen, onClose, onCreate }: CreateOrderModalProps) {
  const submit = async (values: CreateOrderValues) => {
    await onCreate({ ...values, price: Number(values.price) });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Создать заявку"
      description="Опишите задачу, укажите цену и город — заявка появится в кабинете."
    >
      <CreateOrderForm onSubmit={submit} />
    </Modal>
  );
}
