export const state = () => ({
  user: null,
  showDrawer: false,
});

export const mutations = {
  setUser(state, { user }) {
    state.user = user;
  },
  closeDrawer(state) {
    state.showDrawer = false;
  },
  openDrawer(state) {
    state.showDrawer = true;
  },
};

export const actions = {
  async getUserData({ commit, dispatch }) {
    try {
      const data = await this.$api.$get('user/logged/');
      commit('setUser', { user: data });
    } catch (error) {
      console.error('Erro ao receber dados do usuário:', error);
      dispatch('auth/logout', null, { root: true });
      throw error; // Rejeita a promise com o erro para quem chamou
    }
  },
  // };

  // getUserData({ commit }) {
  // return await this.$api.$get('user-profile/logged').then((data) => {
  //     commit('setUser', {
  //         user: data,
  //     })
  // })
//     commit('setUser', {
//       user: {
//         email: 'root@hex360.com.br',
//         first_name: 'Usuario',
//         id: 1,
//         last_name: 'Teste',
//         username: 'root',
//         user_staff: true,
//         settings: {
//           map_zoom_buttons_visible: true,
//           drawer_open_on_init: true,
//           map_search_button_visible: true,
//           map_scale_visible: true,
//           minimap_visible: true,
//           map_pointer_coordinates_visible: true,
//         },
//       },
//     });
//   },
};

export const getters = {
  userData: (state) => state.user,
};
