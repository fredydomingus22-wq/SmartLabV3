import { FoodSafetyBoard } from "../components/FoodSafetyBoard";

export default function PCCPage() {
    return (
        <FoodSafetyBoard
            type="pcc"
            title="PCC Management"
            description="Pontos Críticos de Controlo com limites críticos, evidências e ações imediatas."
        />
    );
}
