import { AntDesign } from '@expo/vector-icons';
import { NavigationContainer, RouteProp } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  AlertDialog, Box, Center, extendTheme, Flex, Heading, HStack,
  IconButton, Input, NativeBaseProvider, Spacer, StatusBar, VStack, Button, Checkbox
} from 'native-base';
import React, { useEffect, useState } from 'react';
import { NavigationScreenProp } from 'react-navigation';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Themes = {
  lightDefault: {
    colors: {
      'background': {
        '50': '#fcfdfe',
        '100': '#f8fafc',
        '200': '#eef3f8',
        '300': '#e3ecf3',
        '400': '#cfdeeb',
        '500': '#bad0e2',
        '600': '#a7bbcb',
        '700': '#8c9caa',
        '800': '#707d88',
        '900': '#5b666f'
      },
      text: {
        900: '#000000'
      },
      'accent': {
        '50': '#f2f8fa',
        '100': '#e6f1f6',
        '200': '#bfdde8',
        '300': '#99c8da',
        '400': '#4d9ebe',
        '500': '#0075a2',
        '600': '#006992',
        '700': '#00587a',
        '800': '#004661',
        '900': '#00394f'
      },
      'secondaccent': {
        '50': '#f8fffe',
        '100': '#f1fffd',
        '200': '#dbfffa',
        '300': '#c5fff6',
        '400': '#9afff0',
        '500': '#6fffe9',
        '600': '#64e6d2',
        '700': '#53bfaf',
        '800': '#43998c',
        '900': '#367d72'
      }
    }
  },
};

const selectedTheme = extendTheme(Themes.lightDefault);

type CustomThemeType = typeof selectedTheme;

declare module 'native-base' {
  interface ICustomTheme extends CustomThemeType { }
}

interface navprop {
  navigation: NavigationScreenProp<any, any>;
  route: RouteProp<{ params: { list: any[], title: string } }>;
}

async function writeData(data: object, listName: string): Promise<void> {
  AsyncStorage.setItem(listName, JSON.stringify(data));

  AsyncStorage.getItem('listOfLists').then((value: any): any => {
    const splitdat: any[] = value === null ? [] : value.split(',');
    if (!splitdat.includes(listName)) {
      splitdat.push(listName);
      AsyncStorage.setItem('listOfLists', splitdat.toString());
    }
  })
}

async function getData(): Promise<any[]> {
  const listOfLists: any[] = await AsyncStorage.getItem('listOfLists')
    .then((value: any): any[] => {
      if (!value) { return []; }

      if (value.includes(',')) {
        return value.split(',');
      } else {
        return [value];
      }
    });

  if (listOfLists.length === 0) return [];

  let dataArray: any[] = [];

  for (let i = 0; i < listOfLists.length; i++) {
    const data = await AsyncStorage.getItem(listOfLists[i]);

    if (data) { dataArray.push(JSON.parse(data)); }
  }

  return dataArray;
}

const ListView = (props: navprop) => {
  const [itemlist, setItemList] = useState(props.route.params.list);
  const [itemname, setItemName] = useState('');

  const [isopen, setopen] = useState<boolean>(false);

  const mutList = React.useRef(itemlist);

  const cancelAdd = () => {
    setopen(false);
    setItemName('');
  };
  const onClose = () => {
    setopen(false);
    addItem();
  }

  const cancelRef = React.useRef(null);

  function addItem() {
    if (itemname.length > 0) {
      setItemList([...mutList.current, {
        name: itemname,
        checked: false
      }]);

      setItemName('');
    }
  }

  function updateIfChecked(isSelected: boolean, itemName: string, itemIndex: number) {
    setItemList(mutList.current.map((item, index) => {
      if (index === itemIndex) {
        return {
          name: itemName,
          checked: isSelected
        };
      } else {
        return item;
      }
    }));
  }

  useEffect(() => {
    mutList.current = itemlist;
    writeData({ name: props.route.params.title, items: itemlist }, props.route.params.title)
  }, [itemlist]);

  const listName = props.route.params.title;

  return (
    <NativeBaseProvider theme={selectedTheme}>
      <Flex flexDirection="column">
        <Box w="full" h="24" bg="background.100"
          borderColor="background.300" borderBottomWidth="2"
          alignContent="flex-start">
          <VStack >
            <Box w="full" h="10" bg="background.100" />
            <Flex flexDirection="row">
              <Heading size="3xl" marginLeft="4">{listName.length > 15 ? `${listName.slice(0, 12)}...` : listName}</Heading>
              <Spacer />
              <IconButton icon={<AntDesign name="plus" size={36} color="gray" />}
                marginRight="2" marginTop="2" onPress={() => { setopen(true) }} />
            </Flex>
          </VStack>
        </Box>

        <Box w="full" h="full" bg="background.200"
          alignContent="flex-start" paddingX="4" marginTop="2">
          <VStack space="2">
            {itemlist.map((list, index) => {
              const itemName = list.name;
              const isChecked = list.checked;
              return (
                <Box w="full" h="8" bg="background.100" alignContent="flex-start"
                  paddingLeft="2" rounded="lg" marginY="2" key={index}>

                  <Flex flexDirection="row">
                    <Heading>{itemName}</Heading>
                    <Spacer />
                    <Checkbox marginTop="1.5" marginRight="2" value="list-item" isChecked={isChecked}
                      accessibilityLabel={`${itemName} is ${isChecked ? `checked` : `not checked`}`}
                      onChange={(isSelected) => {
                        updateIfChecked(isSelected, itemName, index);
                      }} />
                  </Flex>
                </Box>
              )
            })}
          </VStack>
        </Box>
      </Flex>

      <Center>
        <AlertDialog isOpen={isopen} leastDestructiveRef={cancelRef} onClose={cancelAdd}>
          <AlertDialog.Content>
            <AlertDialog.CloseButton />
            <AlertDialog.Header>Add List Item</AlertDialog.Header>
            <AlertDialog.Body>
              Enter item name:
              <Input value={itemname} onChangeText={(text) => { setItemName(text) }} />
            </AlertDialog.Body>
            <AlertDialog.Footer>
              <Button onPress={onClose}>Add</Button>
            </AlertDialog.Footer>
          </AlertDialog.Content>
        </AlertDialog>
      </Center>
    </NativeBaseProvider>
  )
}

const ListOfList = (props: navprop) => {
  // [{
  //   name: 'Test Lists',
  //   items: [{
  //     name: 'Test Item 1',
  //     checked: false
  //   }]
  // },
  // {
  //   name: 'Test List 2',
  //   items: [{
  //     name: 'Test Item 1',
  //     checked: false
  //   }]
  // }]

  const [listoflists, setlists] = useState<Array<any> | any>([]);

  const [isopen, setopen] = useState<boolean>(false);
  const [listNameValue, setListNameVal] = useState<string>('');

  const cancelAdd = () => {
    setopen(false);
    setListNameVal('');
  };
  const onClose = () => {
    setopen(false);
    addList();
  }

  const cancelRef = React.useRef(null);

  const handleChange = (text: any) => setListNameVal(text);

  useEffect(() => {
    getData().then((data: any) => {
      if (data.length > 0) {
        setlists(data);
      }
    });
  }, [])

  function addList() {
    if (listNameValue.length > 0) {
      const datatowrite = { name: listNameValue, items: [] };
      setlists([...listoflists, datatowrite]);
      writeData(datatowrite, listNameValue);
      setListNameVal('');
    }
  }

  const navigation = props.navigation

  return (
    <>
      <NativeBaseProvider theme={selectedTheme}>
        <Flex flexDirection="column">
          <Box w="full" h="24" bg="background.100"
            borderColor="background.300" borderBottomWidth="2"
            alignContent="flex-start">
            <VStack>
              <Box w="full" h="10" bg="background.100" />

              <Flex flexDirection="row">
                <Heading size="3xl" marginLeft="4">Lists</Heading>
                <Spacer />
                <IconButton icon={<AntDesign name="plus" size={36} color="gray" />} marginRight="2" marginTop="2"
                  onPress={() => { setopen(true) }} />
              </Flex>
            </VStack>
          </Box>

          <Box w="full" h="full" bg="background.200"
            alignContent="flex-start" paddingX="4" marginTop="2">
            <VStack space="2">
              {
                listoflists.map((list: any, key: any) => {
                  return (
                    <HStack key={key} onTouchEnd={() => {
                      navigation.navigate('ListView', {
                        list: list.items,
                        title: list.name,
                      });
                    }}>
                      <Box w="full" h="8" bg="background.100" alignContent="flex-start"
                        paddingLeft="2" rounded="lg" marginY="2">
                        <Heading>{list.name}</Heading>
                      </Box>
                    </HStack>
                  )
                })
              }
            </VStack>
          </Box>
        </Flex>

        <Center>
          <AlertDialog isOpen={isopen} leastDestructiveRef={cancelRef} onClose={cancelAdd}>
            <AlertDialog.Content>
              <AlertDialog.CloseButton />
              <AlertDialog.Header>Create List</AlertDialog.Header>
              <AlertDialog.Body>
                Enter list name:
                <Input value={listNameValue} onChangeText={handleChange} placeholder="List Name" />
              </AlertDialog.Body>
              <AlertDialog.Footer>
                <Button onPress={onClose}>Add</Button>
              </AlertDialog.Footer>
            </AlertDialog.Content>
          </AlertDialog>
        </Center>
      </NativeBaseProvider>
    </>
  )
}

const App: React.FC = () => {
  const Navigation = createNativeStackNavigator();

  return (
    <>
      <StatusBar hidden />

      <NavigationContainer>
        <Navigation.Navigator screenOptions={{
          headerShown: false
        }}>
          <Navigation.Screen name="ListOfList" component={ListOfList} />
          <Navigation.Screen name="ListView" component={ListView} />
        </Navigation.Navigator>
      </NavigationContainer>
    </>
  );
}

export default App;