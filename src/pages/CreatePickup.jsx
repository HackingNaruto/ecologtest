import { useState } from "react";
import { createBulkPickup } from "../services/supabaseApi"; // Using the new service
import { useAuth } from "../contexts/AuthContext";

export default function CreatePickup() {
  const { user } = useAuth();
  const [items, setItems] = useState([
    { device_type: "", brand_and_model: "", condition: "", quantity: 1, estimated_value_per_unit: 0 }
  ]);

  const addItem = () => {
    setItems([...items, { device_type: "", brand_and_model: "", condition: "", quantity: 1, estimated_value_per_unit: 0 }]);
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...items];
    updatedItems[index][field] = value;
    setItems(updatedItems);
  };

  const handleSubmit = async () => {
    try {
      const totalPayout = items.reduce((sum, item) => sum + (item.estimated_value_per_unit * item.quantity), 0);
      await createBulkPickup(user.id, totalPayout, items);
      alert("Bulk Pickup Request Created!");
    } catch (error) {
      console.error("Error creating bulk pickup:", error);
    }
  };

  return (
    // NOTE: Maintaining your original wrapper/styling here
    <div>
      {items.map((item, index) => (
        <div key={index} className="item-row">
          <input placeholder="Device Type" onChange={(e) => handleItemChange(index, 'device_type', e.target.value)} />
          <input placeholder="Brand/Model" onChange={(e) => handleItemChange(index, 'brand_and_model', e.target.value)} />
          <input placeholder="Condition" onChange={(e) => handleItemChange(index, 'condition', e.target.value)} />
          <input type="number" placeholder="Qty" onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))} />
          <input type="number" placeholder="Value/Unit" onChange={(e) => handleItemChange(index, 'estimated_value_per_unit', parseFloat(e.target.value))} />
        </div>
      ))}
      
      <button onClick={addItem}>+ Add Item</button>
      <button onClick={handleSubmit}>Submit Bulk Pickup</button>
    </div>
  );
}