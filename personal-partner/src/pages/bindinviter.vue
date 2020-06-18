<template>
	<div class="bind-inviter-container">
    <div class="invite-code-input">
      <input type="text" v-model="inviteCode" placeholder="请输入推荐人邀请码" maxlength="6" :readonly="isQrScanEntering" :disabled="isQrScanEntering" :class="{'input-disabled': isQrScanEntering}" />
    </div>
    <div class="bind-inviter-tip">*绑定后将不可更改，请谨慎输入</div>
    <div class="bind-inviter-btns">
      <div class="bind-inviter-cancel" @click="gotoIndex(false)">返回</div>
      <div class="bind-inviter-confirm" @click="openBindModal">绑定</div>
    </div>
    <div v-if="isBindModal" class="bind-inviter-window"></div>
    <div v-if="isBindModal" class="bind-inviter-modal">
      <div class="bind-modal-tip">绑定后将不可更改，是否绑定</div>
      <div class="bind-modal-code">{{inviteCode}}</div>
      <div class="bind-modal-btn">
        <div class="bind-modal-cancel" @click="closeModal">取消</div>
        <div class="bind-modal-confirm" :style="isBind ? 'background: #ccc;' : ''" @click="bindInviter">绑定</div>
      </div>
    </div>
  </div>
</template>
<script type="text/javascript">
  import { baseUrl, getRequestParams, sendJsonPostRequest, pageRouter, saveSession, getSession } from 'src/assets/utils.js';
  import { Indicator, MessageBox, Toast } from 'mint-ui';
  import Bus from 'src/assets/bus/bus';

  export default {
    components: {
      Indicator,
      MessageBox,
      Toast
    },
    data() {
      return {
        inviteCode: '',
        qrInviteCode: this.$route.query.qrInviteCode,
        isBindModal: false, // 绑定弹窗
        isBind: false, // 是否点击绑定
        isQrScanEntering: false, // 是否扫描政企合伙人邀请码的二维码进入
        submitDisabled: false // 是否禁止绑定提交
      };
    },
    watch: {
    },
    created() {
      Indicator.close();
      document.title = '绑定推荐人';
      if (this.qrInviteCode) {
        this.inviteCode = this.qrInviteCode;
        this.isQrScanEntering = true;
      }
      let ptDetailInfo = getSession('ptDetailInfo', true);
      if ('' + ptDetailInfo.partnerType === '5' || ptDetailInfo.inviteCode) {
        this.submitDisabled = true;
      }
    },
    methods: {
      openBindModal() {
        if (!/[A-Z]{2}\d{4}/i.test(this.inviteCode)) {
          Toast({message: '请输入正确的6位邀请码', duration: 1200});
          return;
        }
        if (this.submitDisabled) {
          Toast({message: '你已绑定过邀请码，请勿重复绑定！', duration: 1200});
          return;
        }
        this.isBindModal = true;
      },
      bindInviter: function() {
        if (this.isBind) {
          return;
        }
        this.isBind = true;
        let url = baseUrl + '/register/partner/gov/binding';
        let params = {
          'phone': this.$route.query.p,
          'inviteCode': this.inviteCode
        };
        let reqPrams = getRequestParams(url, params, this.bindInviterSuc, this.bindInviterFail, '');
        Indicator.open();
        sendJsonPostRequest(this, reqPrams);
      },
      closeModal() {
        this.isBindModal = false;
      },
      bindInviterSuc: function(vue, json) {
        Indicator.close();
        if (json.status !== 0) {
          this.isBind = false;
          this.isBindModal = false;
          MessageBox.alert(json.msg || '绑定失败');
          return;
        }
        Toast('绑定成功');
        // window.history.back(-1);
        saveSession('partnerticket', json.data.token);
        saveSession('ptPublicOpenId', json.data.partner.openId);
        saveSession('ptDetailInfo', json.data.partner);
        setTimeout(() => {
          Bus.$emit('on-inviter-bind');
          this.gotoIndex();
        }, 1000);
      },
      bindInviterFail() {
        Toast('网络出错');
        this.isBind = false;
      },
      gotoIndex: function(ifBinded = true) {
        if (ifBinded || !this.isQrScanEntering) {
          Bus.$emit('on-head-img-tab', true);
        }
        pageRouter(this, {path: '/index', query: {p: this.$route.query.p, ptid: this.$route.query.ptid}}, 'replace');
      }
    }
  };
</script>
<style type="text/css">
   body {
    background: #f0f0f0;
   }
  .bind-inviter-container {
    height: calc(100% - 50px);
    background: #f0f0f0;
    padding: 20px 8%;
  }
  .invite-code-input {
    width: 100%;
    height: 45px;
  }
  .invite-code-input input {
    height: 45px;
    width: 100%;
    text-indent: 10px;
    border-radius: 4px;
  }
  .input-disabled {
    background: #e6e6e5;
  }
  .bind-inviter-tip {
    font-family: '黑体';
    font-size: 12px;
    color: #FF6E6F;
    margin: 10px 0;
    text-indent: 2px;
  }
  .bind-inviter-btns {
    position: relative;
    height: 45px;
    margin-top: 60px;
  }
  .bind-inviter-cancel, .bind-inviter-confirm {
    float: left;
    width: 47.5%;
    height: 45px;
    border-radius: 4px;
    line-height: 45px;
    text-align: center;
  }
  .bind-inviter-cancel {
    border: 1px solid #3D8CF7;
    background: #fff;
    color: #3D8CF7;
    margin-right: 2.5%;
  }
  .bind-inviter-confirm {
    background: #3D8CF7;
    color: #fff;
    margin-left: 2.5%;
  }
  .bind-inviter-window {
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.60);
    position: fixed;
    top: 0;
    left: 0;
  }
  .bind-inviter-modal {
    width: 75%;
    height: 200px;
    background: #fff;
    position: fixed;
    top: 90px;
    left: 12.5%;
    border-radius: 4px;
  }
  .bind-modal-tip {
    width: 100%;
    text-align: center;
    font-size: 14px;
    color: #333;
    margin-top: 40px;
  }
  .bind-modal-code {
    margin-top: 15px;
    width: 100%;
    text-align: center;
    font-size: 32px;
    font-weight: bold;
  }
  .bind-modal-btn {
    width: 100%;
    height: 30px;
    margin-top: 30px;
    text-align: center;
  }
  .bind-modal-cancel, .bind-modal-confirm {
    display: inline-block;
    width: 35%;
    height: 30px;
    border-radius: 4px;
    line-height: 30px;
    text-align: center;
  }
  .bind-modal-cancel {
    border: 1px solid #3D8CF7;
    background: #fff;
    color: #3D8CF7;
    margin-right: 4%;
  }
  .bind-modal-confirm {
    background: #3D8CF7;
    color: #fff;
    margin-left: 4%;
  }
</style>
