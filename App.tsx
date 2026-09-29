import React, { useEffect, useState } from 'react';
import {
  Button,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
} from 'react-native';

import { getDatabase, onValue, push, ref, remove } from 'firebase/database';
import { app } from './firebaseConfig';

interface ShoppingItem {
  id: string;
  product: string;
  amount: string;
}

const db = getDatabase(app);

export default function App() {
  const [product, setProduct] = useState('');
  const [amount, setAmount] = useState('');
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([]);

  useEffect(() => {
    const shoppingListRef = ref(db, 'shoppingList');

    const unsubscribe = onValue(shoppingListRef, (snapshot) => {
      const data = snapshot.val();

      if (data) {
        const list: ShoppingItem[] = Object.entries(data).map(
          ([id, item]: [string, any]) => ({
            id,
            product: item.product,
            amount: item.amount,
          })
        );

        setShoppingList(list);
      } else {
        setShoppingList([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const saveItem = () => {
    if (product.trim() === '' || amount.trim() === '') {
      return;
    }

    const shoppingListRef = ref(db, 'shoppingList');

    push(shoppingListRef, {
      product: product,
      amount: amount,
    });

    setProduct('');
    setAmount('');
  };

  const deleteItem = (id: string) => {
    const itemRef = ref(db, `shoppingList/${id}`);

    remove(itemRef);
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Tuote"
        value={product}
        onChangeText={setProduct}
      />

      <TextInput
        style={styles.input}
        placeholder="Määrä"
        value={amount}
        onChangeText={setAmount}
      />

      <View style={styles.buttonContainer}>
        <Button title="Tallenna" onPress={saveItem} />
      </View>

      <Text style={styles.headerText}>Ostoslista</Text>

      <FlatList
        data={shoppingList}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <Text style={styles.itemText}>
              {item.product}, {item.amount}
            </Text>

            <TouchableOpacity onPress={() => deleteItem(item.id)}>
              <Text style={styles.boughtText}>Valmis</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 60,
  },
  input: {
    width: 200,
    borderColor: 'gray',
    borderWidth: 1,
    padding: 8,
    marginBottom: 8,
  },
  buttonContainer: {
    marginVertical: 10,
    width: 90,
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 10,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  itemText: {
    fontSize: 16,
  },
  boughtText: {
    color: 'blue',
    marginLeft: 10,
    fontSize: 16,
  },
});