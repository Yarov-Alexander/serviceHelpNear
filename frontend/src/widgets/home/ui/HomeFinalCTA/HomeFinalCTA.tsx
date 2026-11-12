import { useOrderFormNavigation } from "@/features/create-order-form";
import { Button } from "../../../../shared/ui/Button";
import "./HomeFinalCTA.scss";


export function HomeFinalCTA() {
  const onScrollToOrder = useOrderFormNavigation();
  return (
    <section className="final-cta">
      <div className="final-cta__inner container">
        <h2 className="final-cta__title">Пусть дело сделает тот, кто рядом.</h2>
        <Button className="final-cta__button" onClick={onScrollToOrder}>
          Создать заказ
        </Button>
      </div>
    </section>
  );
}