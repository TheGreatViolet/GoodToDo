import { AntDesign } from '@expo/vector-icons';
import { NavigationContainer, RouteProp } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  AlertDialog, Box, Center, extendTheme, Flex, Heading, HStack,
  IconButton, Input, NativeBaseProvider, Spacer, StatusBar, VStack, Button
} from 'native-base';
import React, { useState } from 'react';
import { NavigationScreenProp } from 'react-navigation';

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

const ListView = (props: navprop) => {
  return (
    <NativeBaseProvider theme={selectedTheme}>
      <Flex flexDirection="column">
        <Box w="full" h="24" bg="background.100"
          borderColor="background.300" borderBottomWidth="2"
          alignContent="flex-start">
          <VStack >
            <Box w="full" h="10" bg="background.100" />
            <Heading size="3xl" marginLeft="4">{props.route.params.title}</Heading>
          </VStack>
        </Box>

        <Box w="full" h="full" bg="background.200"
          alignContent="flex-start" paddingX="4" marginTop="2">
          <VStack space="2">
            {props.route.params.list.map((list, index) => {
              return (
                <HStack key={index}>
                  <Box w="full" h="8" bg="background.100" alignContent="flex-start"
                    paddingLeft="2" rounded="lg" marginY="2">
                    <Heading>{list.name}</Heading>
                  </Box>
                </HStack>
              )
            })}
          </VStack>
        </Box>
      </Flex>
    </NativeBaseProvider>
  )
}

const ListOfList = (props: navprop) => {
  const [listoflists, setlists] = useState<Array<any> | any>([{
    name: 'Test Lists',
    items: [{
      name: 'Test Item 1',
      checked: false
    }]
  },
  {
    name: 'Test List 2',
    items: [{
      name: 'Test Item 1',
      checked: false
    }]
  }]);

  const [isopen, setopen] = useState<boolean>(false);
  const cancelAdd = () => {
    setopen(false);
    setListNameVal('');
  };
  const onClose = () => {
    setopen(false);
    addList();
  }

  const cancelRef = React.useRef(null);

  const [listNameValue, setListNameVal] = useState<string>('');
  const handleChange = (text: any) => setListNameVal(text);

  function addList() {
    if (listNameValue.length > 0) {
      setlists([...listoflists, { name: listNameValue, items: [] }]);
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
              <HStack>
              </HStack>

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
              {listoflists.map((list: any, key: any) => {
                return (
                  <HStack key={key} onTouchEnd={() => {
                    navigation.navigate('ListView', {
                      list: list.items,
                      title: list.name
                    });
                  }}>
                    <Box w="full" h="8" bg="background.100" alignContent="flex-start"
                      paddingLeft="2" rounded="lg" marginY="2">
                      <Heading>{list.name}</Heading>
                    </Box>
                  </HStack>
                )
              })}
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