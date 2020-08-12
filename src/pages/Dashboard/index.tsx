import React, { useState, useEffect } from 'react';

import Header from '../../components/Header';

import api from '../../services/api';

import Food from '../../components/Food';
import ModalAddFood from '../../components/ModalAddFood';
import ModalEditFood from '../../components/ModalEditFood';

import { FoodsContainer } from './styles';

interface IFoodPlate {
  id: number;
  name: string;
  image: string;
  price: string;
  description: string;
  available: boolean;
}

const Dashboard: React.FC = () => {
  const [foods, setFoods] = useState<IFoodPlate[]>([]);
  const [editingFood, setEditingFood] = useState<IFoodPlate>({} as IFoodPlate);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    async function loadFoods(): Promise<void> {
      const response = await api.get('/foods');
      setFoods(response.data);
    }

    loadFoods();
  }, []);

  async function handleAddFood(
    food: Omit<IFoodPlate, 'id' | 'available'>,
  ): Promise<void> {
    try {
      const response = await api.post('/foods', { ...food, available: true });

      setFoods([...foods, response.data]);
    } catch (err) {
      console.log(err);
    }
  }

  async function handleUpdateFood(
    food: Omit<IFoodPlate, 'id' | 'available'>,
  ): Promise<void> {
    try {
      const editedFood: IFoodPlate = {
        ...food,
        id: editingFood.id,
        available: editingFood.available,
      };

      const response = await api.put<IFoodPlate>(
        `/foods/${editingFood.id}`,
        editedFood,
      );

      const newFoods = foods.map(foodInList => {
        if (foodInList.id === response.data.id) {
          return response.data;
        }
        return foodInList;
      });

      setFoods(newFoods);
    } catch (err) {
      console.log(err);
    }
  }

  async function handleUpdateAvailable(food: IFoodPlate): Promise<void> {
    try {
      console.log(food);
      const response = await api.put<IFoodPlate>(`/foods/${food.id}`, food);

      const newFoods = foods.map(foodInList => {
        if (foodInList.id === response.data.id) {
          return response.data;
        }
        return foodInList;
      });

      setFoods(newFoods);
    } catch (err) {
      console.log(err);
    }
  }

  async function handleDeleteFood(id: number): Promise<void> {
    api.delete(`/foods/${id}`).then(() => {
      const newFoods = foods.filter(food => food.id !== id);
      setFoods(newFoods);
    });
  }

  function toggleModal(): void {
    setModalOpen(!modalOpen);
  }

  function toggleEditModal(): void {
    setEditModalOpen(!editModalOpen);
  }

  function handleEditFood(food: IFoodPlate): void {
    setEditingFood(food);
    toggleEditModal();
  }

  function handleEditAvailability(food: IFoodPlate): void {
    // setEditingFood(food);
    handleUpdateAvailable(food);
  }

  return (
    <>
      <Header openModal={toggleModal} />
      <ModalAddFood
        isOpen={modalOpen}
        setIsOpen={toggleModal}
        handleAddFood={handleAddFood}
      />
      <ModalEditFood
        isOpen={editModalOpen}
        setIsOpen={toggleEditModal}
        editingFood={editingFood}
        handleUpdateFood={handleUpdateFood}
      />

      <FoodsContainer data-testid="foods-list">
        {foods &&
          foods.map(food => (
            <Food
              key={food.id}
              food={food}
              handleDelete={handleDeleteFood}
              handleEditFood={handleEditFood}
              handleEditAvailability={handleEditAvailability}
            />
          ))}
      </FoodsContainer>
    </>
  );
};

export default Dashboard;
