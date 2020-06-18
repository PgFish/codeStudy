import { Dialog } from 'cube-ui'

export function success(content, callback) {
  return new Promise((resolve, reject) => {
    Dialog.$create({
      type: 'alert',
      title: '提示',
      content: content,
      icon: 'cubeic-alert',
      onConfirm: () => {
        if (callback) {
          callback()
        } else {
          resolve()
        }
      }
    }).show()
  })
}

export function warn(content, callback) {
  return new Promise((resolve, reject) => {
    Dialog.$create({
      type: 'alert',
      title: '提示',
      content: content,
      icon: 'cubeic-warn',
      onConfirm: () => {
        if (callback) {
          callback()
        } else {
          resolve()
        }
      }
    }).show()
  })
}
export const alert = warn
export function wrong(content, callback) {
  return new Promise((resolve, reject) => {
    Dialog.$create({
      type: 'alert',
      title: '提示',
      content: content,
      icon: 'cubeic-wrong',
      onConfirm: () => {
        if (callback) {
          callback()
        } else {
          resolve()
        }
      }
    }).show()
  })
}

export function confirm(deploy, onConfirm, onCancel) {
  return new Promise((resolve, reject) => {
    let param = Object.assign({}, {
      title: '提示',
      content: '',
      confirmBtnText: '确定',
      cancelBtnText: '取消'
    }, deploy)
    Dialog.$create({
      type: 'confirm',
      icon: 'cubeic-alert',
      title: param.title,
      content: param.content,
      confirmBtn: {
        // eslint-disable-next-line no-undef
        text: param.confirmBtnText,
        active: true,
        disabled: false,
        href: 'javascript:;'
      },
      cancelBtn: {
        // eslint-disable-next-line no-undef
        text: param.cancelBtnText,
        active: false,
        disabled: false,
        href: 'javascript:;'
      },
      onConfirm: () => {
        if (onConfirm) {
          onConfirm()
        } else {
          resolve('confirm')
        }
      },
      onCancel: () => {
        if (onCancel) {
          onCancel()
        } else {
          resolve('cancel')
        }
      }
    }).show()
  })
}
