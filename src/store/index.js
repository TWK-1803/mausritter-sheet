import { createStore } from 'vuex'
import { version as uuidVersion } from 'uuid';
import { validate as uuidValidate } from 'uuid';

import config from '@/config'
import { request } from '@/services/api'
import { d6 } from '@/services/dice-roller'
import { loadPrefs, savePrefsKey } from '@/services/preferences'

// Mouse names of every locale, bundled eagerly so switching locale stays synchronous
const mouseNames = import.meta.glob('../locales/mouse-names.*.js', { eager: true })

function uuidValidateV5 (uuid) {
  return uuidValidate(uuid) && uuidVersion(uuid) === 5;
}

// Save a sheet (and its hirelings) on the colony server: POST /sheets
function postSheet (tableId, name, data) {
  const { sheet } = data
  const hirelings = (data.hirelings || []).map(h => ({
    name: h.sheet.name,
    desc: h.sheet.desc,
    str: h.sheet.currentStr,
    str_max: h.sheet.maxStr,
    dex: h.sheet.currentDex,
    dex_max: h.sheet.maxDex,
    wil: h.sheet.currentWil,
    wil_max: h.sheet.maxWil,
    hp: h.sheet.currentHP,
    hp_max: h.sheet.maxHP,
    level: h.sheet.level
  }))
  return request('/sheets', {
    method: 'POST',
    query: {
      vtable: tableId,
      name,
      str: sheet.currentStr,
      str_max: sheet.maxStr,
      dex: sheet.currentDex,
      dex_max: sheet.maxDex,
      wil: sheet.currentWil,
      wil_max: sheet.maxWil,
      hp: sheet.currentHP,
      hp_max: sheet.maxHP,
      level: sheet.level
    },
    body: { data: '', hirelings }
  })
}

export const store = createStore({
  state () {
    return {
      config,
      currentSheet: null,
      currentSheetRaw: null,
      currentSlotIndex: -1,
      hirelings: [],
      history: [],
      locale: null,
      matrinames: [],
      names: [],
      preferences: {},
      tableId: null,
      tableState: null
    }
  },
  getters: {
    config: state => { return state.config || {} },
    currentSheet: state => { return state.currentSheet || null },
    currentSheetRaw: state => { return state.currentSheetRaw || null },
    currentSlotIndex: state => { return state.currentSlotIndex },
    hirelings: state => { return state.hirelings || [] },
    hirelingByIndex: state => index => { return state.hirelings[index] || {} },
    history: state => { return state.history || [] },
    locale: state => { return state.locale },
    matrinames: state => { return state.matrinames || [] },
    names: state => { return state.names || [] },
    preferences: state => { return state.preferences || {} },
    sheetSignature: state => { return state.currentSheet.sheet ? state.currentSheet.sheet.name + ` (${state.currentSheet.sheet.background})`: null },
    tableId: state => { return state.tableId },
    tableState: state => { return state.tableState }
  },
  mutations: {
    FAILURE (state, error) {
      console.trace('[ERROR]', error)
      state.tableState = error
      throw error
    },
    currentSheet (state, { json, raw }) {
      state.currentSheet = json
      state.currentSheetRaw = raw
    },
    hirelingClear (state) {
      state.hirelings = []
    },
    hirelingCreate (state, hireling) {
      let result = {
        inventory: []
      }
      result.sheet = { ...{
        maxDex: d6() + d6(),
        maxHP: d6(),
        maxStr: d6() + d6(),
        maxWil: d6() + d6(),
        desc: hireling.label || '',
        name: '',
        look: '',
        wages: 0,
        level: 1,
        xp: 0
      }, ...hireling }
      result.sheet.currentDex = result.sheet.maxDex
      result.sheet.currentHP = result.sheet.maxHP
      result.sheet.currentStr = result.sheet.maxStr
      result.sheet.currentWil = result.sheet.maxWil
      state.hirelings.push({ ...result, ...hireling })
    },
    hirelingDismiss (state, index) {
      const tmp = [ ...state.hirelings ]
      tmp.splice(index, 1)
      state.hirelings = tmp
    },
    hirelingsSet (state, hirelings = []) {
      state.hirelings = hirelings
    },
    historyAdd (state, { type, message, color='black', secondary = '' }) {
      state.history.unshift({ type, message, color, secondary, date: new Date() })
    },
    historyClear (state) {
      state.history = []
    },
    setCurrentSlot (state, index) {
      state.currentSlotIndex = index
    },
    setLocale (state, locale) {
      state.locale = locale
    },
    setMatrinames (state, names) {
      state.matrinames = names
    },
    setNames (state, names) {
      state.names = names
    },
    setPrefs (state, preferences) {
      state.preferences = preferences
    },
    setTableId (state, tableId) {
      state.tableId = tableId
    }
  },
  actions: {
    async sendDiceResult ({ state, getters, commit }, { diceResult }) {
      if (!getters['tableId'] || !getters['sheetSignature'] || !diceResult) {
        commit('FAILURE', 'Cannot send dice result to colony.')
        return
      }

      try {
        const response = await request('/dices', {
          method: 'POST',
          query: { vtable: getters['tableId'], sheet: getters['sheetSignature'] },
          body: diceResult
        })
        state.tableState = { status: response.status, statusText: response.statusText }
        return response
      } catch (error) {
        commit('FAILURE', error)
      }
    },
    async sendCurrentSheet ({ state, getters, commit }) {
      if (!getters['tableId'] || !getters['sheetSignature'] || !getters['currentSheet']) {
        commit('FAILURE', 'Cannot send sheet to colony!')
        return
      }

      try {
        const response = await postSheet(getters['tableId'], getters['sheetSignature'], getters['currentSheet'])
        state.tableState = { status: response.status, statusText: response.statusText }
      } catch (error) {
        commit('FAILURE', error)
      }
    },
    async sendSheet ({ state, getters, commit }, data) {
      if (!getters['tableId']) {
        commit('FAILURE', 'Cannot send sheet to colony!')
        return
      }

      try {
        const response = await postSheet(getters['tableId'], getters['sheetSignature'], data)
        state.tableState = { status: response.status, statusText: response.statusText }
      } catch (error) {
        commit('FAILURE', error)
      }
    },
    setTableId ({ commit, state, dispatch }, tableId) {
      commit('setTableId', tableId)
      if (uuidValidateV5(tableId) && state.currentSheet) {
        dispatch('sendCurrentSheet', tableId)
          .catch ((error) => {
            commit('FAILURE', error)
          })
      }
    },
    changeLocale (context, locale) {
      context.commit('setLocale', locale)
      const module = mouseNames[`../locales/mouse-names.${locale}.js`]
      context.commit('setMatrinames', module.matrinames )
      context.commit('setNames', module.names )
    },
    historyClear (context) {
      context.commit('historyClear')
    },
    hirelingsSet (context, hirelings) {
      context.commit('hirelingsSet', hirelings)
    },
    loadPreferences (context) {
      context.commit('setPrefs', loadPrefs())
    },
    savePreferences (context, { key, value }) {
      context.commit('setPrefs', savePrefsKey(key, value))
    }
  }
})
