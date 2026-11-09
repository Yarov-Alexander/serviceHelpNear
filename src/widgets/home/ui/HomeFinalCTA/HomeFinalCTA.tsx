import { Button } from "../../../../shared/ui/Button";
import "./HomeFinalCTA.scss";

type HomeFinalCTAProps = {
  onCreateOrder: () => void;
};

export function HomeFinalCTA({ onCreateOrder }: HomeFinalCTAProps) {
  return (
    <section className="final-cta">
      <div className="final-cta__inner container">
        <h2 className="final-cta__title">Пусть дело сделает тот, кто рядом.</h2>
        <Button className="final-cta__button" onClick={onCreateOrder}>
          Создать заказ
        </Button>
      </div>
    </section>
  );
}