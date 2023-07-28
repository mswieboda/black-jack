import { showMessage } from 'react-native-flash-message'

export const show = (any: any) => {
  showMessage({
    duration: 3000,
    ...any,
  })
}

export const showInfo = (message: string) => {
  show({
    message,
    type: 'info',
    backgroundColor: '#3399ff',
  })
}

export const showWarning = (message: string) => {
  show({
    message,
    type: 'info',
    backgroundColor: '#ff9933',
  })
}

export const showError = (message: string) => {
  show({
    message,
    type: 'info',
    backgroundColor: '#aa0000',
  })
}
