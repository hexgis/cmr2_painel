<template>
    <div class="bottom-buttons">
        <v-col>
            <v-row>
                <v-btn icon large class="mx-auto" @click="goToCriticisms">
                    <v-tooltip left>
                        <template #activator="{ on: onTooltip }">
                            <v-icon color="white" v-on="onTooltip">
                                mdi-comment-text-multiple
                            </v-icon>
                        </template>
                        <span>{{ $t('criticisms-suggestions-tooltip') }}</span>
                    </v-tooltip>
                </v-btn>
            </v-row>
            <v-row>
                <v-menu left offset-x>
                    <template #activator="{ on: onMenu }">
                        <v-btn icon large class="mx-auto" v-on="onMenu">
                            <v-tooltip left>
                                <template #activator="{ on: onTooltip }">
                                    <v-icon color="white" v-on="onTooltip">
                                        mdi-account-circle
                                    </v-icon>
                                </template>
                                <span>{{ $t('profile-tooltip') }}</span>
                            </v-tooltip>
                        </v-btn>
                    </template>
                    <v-card>
                        <v-card-title
                            v-if="hasFirstOrLastName"
                            class="username"
                        >
                            <v-icon dark> mdi-account </v-icon>
                            <span v-if="!!user.first_name" class="pl-2">
                                {{ user.first_name }}
                            </span>
                            <span v-if="!!user.last_name" class="pl-2">
                                {{ user.last_name }}
                            </span>
                        </v-card-title>
                        <v-list-item @click="openSettings()">
                            <v-icon> mdi-cog </v-icon>
                            <span class="pl-2">
                                {{ $t('preferences-button') }}
                            </span>
                        </v-list-item>
                        <v-list-item @click="goToMain()">
                            <v-icon> mdi-home </v-icon>
                            <span class="pl-2">
                                {{ $t('home-button') }}
                            </span>
                        </v-list-item>
                        <v-list-item @click="logout()">
                            <v-icon> mdi-logout </v-icon>
                            <span class="pl-2">
                                {{ $t('logout-button') }}
                            </span>
                        </v-list-item>
                    </v-card>
                </v-menu></v-row
            >
        </v-col>
        <ProfilePanelSettings
            v-if="settingsOpened"
            @onDialogClose="settingsOpened = false"
        />
    </div>
</template>

<i18n>
{
    "en": {
        "criticisms-suggestions-tooltip": "Criticisms and suggestions",
        "profile-tooltip": "Profile",
        "preferences-button": "Preferences",
        "logout-button": "Log out",
        "home-button": "Home"
    },
    "pt-br": {
        "criticisms-suggestions-tooltip":"Criticas e sugestões",
        "profile-tooltip": "Perfil",
        "preferences-button": "Preferências",
        "logout-button": "Sair",
        "home-button": "Início"
    }
}
</i18n>

<script>
import { mapActions, mapState } from 'vuex'

import ProfilePanelSettings from '@/components/profile/ProfilePanelSettings'

export default {
    name: 'ProfileButtons',

    components: {
        ProfilePanelSettings,
    },

    model: {
        prop: 'settings',
        event: 'update',
    },

    props: {
        settings: {
            type: Boolean,
            default: false,
        },
    },

    data: () => ({
        settingsOpened: false,
        hasAnalytics: process.env.ANALYTICS === 'true',
    }),

    watch: {
        settings(value) {
            this.settingsOpened = value
        },

        settingsOpened(value) {
            this.$emit('update', value)
        },
    },

    methods: {
        openSettings() {
            this.settingsOpened = true
        },
        goToMain() {
            this.$router.replace(this.localePath('/portal'))
        },
        goToCriticisms() {
            window.location.href = 'http://localhost:3000/admin/criticas/'
        },

        ...mapActions('auth', ['logout']),
    },

    computed: {
        hasFirstOrLastName() {
            return this.user && (this.user.first_name || this.user.last_name)
        },
        ...mapState('userProfile', ['user']),
    },
}
</script>

<style lang="sass">
.bottom-buttons
  position: absolute
  display: flex
  width: 100%
  bottom: 0
  padding: 3px 0

.username
  pointer-events: none
  padding: 12px
  font-size: 1.1em
  background: black
  color: whitesmoke
</style>
