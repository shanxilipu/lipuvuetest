export default {
  namespace: 'UserCodeLinkModel',
  state: {
    selectedItem: {}, // 左侧目录树选中的菜单
    fromUserId: 0, // 复制配置信息用户id
    toUserId: 0, // 粘贴配置信息用户id
  },
  reducers: {
    save(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    clearState(state) {
      return {
        ...state,
        selectedItem: {},
      };
    },
  },
  effects: {},
};
