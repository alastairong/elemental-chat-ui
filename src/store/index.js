import Vue from "vue";
import Vuex from "vuex";
import elementalChat from "@/applications/ElementalChat/store/elementalChat";
import { AdminWebsocket, AppWebsocket } from "@holochain/conductor-api";
import { persistencePlugin } from "./persistencePlugin";
import { getPersistedState } from "./stateMapper";

Vue.use(Vuex);
const ADMIN_PORT = 3301;
const APP_ID = "ElementalChat";
const today = new Date();
const dd = String(today.getUTCDate());
const mm = String(today.getUTCMonth() + 1); //January is 0!
const yyyy = String(today.getUTCFullYear());
export default new Vuex.Store({
  state: {
    connectedToHolochain: false,
    today: { year: yyyy, month: mm, day: dd }
  },
  mutations: {
    setAgentKey(state, payload) {
      state.agentKey = payload;
    },
    setPersistedAgentKey(state, payload) {
      state.agentKey = payload;
    },
    setAppInterface(state, payload) {
      state.appInterface = payload;
    },
    setPersistedAppInterface(state, payload) {
      state.appInterface = payload;
    },
    setHolochainClient(state, payload) {
      state.holochainClient = payload;
      state.connectedToHolochain = true;
    }
  },
  actions: {
    initialiseAgent({ commit }) {
      getPersistedState("setAgentKey").then(agentKey => {
        console.log(agentKey);
        if (agentKey === undefined || agentKey === null) {
          AdminWebsocket.connect(`ws://localhost:${ADMIN_PORT}`).then(admin => {
            admin.generateAgentPubKey().then(agentKey => {
              commit("setAgentKey", agentKey);
              admin
                .installApp({
                  app_id: APP_ID,
                  agent_key: agentKey,
                  dnas: [
                    {
                      path:
                        "/Users/philipbeadle/holochain-rsm/elemental-chat/elemental-chat.dna.gz",
                      nick: "Elemental Chat"
                    }
                  ]
                })
                .then(app => {
                  const cellId = app.cell_data[0][0];
                  admin.activateApp({ app_id: APP_ID });
                  admin.attachAppInterface({ port: 0 }).then(appInterface => {
                    commit("setAppInterface", {
                      port: appInterface.port,
                      cellId
                    });
                    AppWebsocket.connect(
                      `ws://localhost:${appInterface.port}`
                    ).then(client => {
                      commit("setHolochainClient", client);
                    });
                  });
                });
            });
          });
        } else {
          commit("setPersistedAgentKey", agentKey);
          getPersistedState("setAppInterface").then(appInterface => {
            commit("setPersistedAppInterface", {
              port: appInterface.port,
              cellId: appInterface.cellId
            });
            AppWebsocket.connect(`ws://localhost:${appInterface.port}`).then(
              client => {
                console.log("persist");
                commit("setHolochainClient", client);
              }
            );
          });
        }
      });
    }
  },
  modules: {
    elementalChat
  },
  plugins: [persistencePlugin]
});
