<template>
  <div class="user">
    <span class="d-flex align-center justify-space-between">

      <h1>{{ $t('manageUsers') }}</h1>
      <v-tooltip bottom>
        <template #activator="{ on, attrs }">
          <v-btn
            color="primary"
            text
            v-bind="attrs"
            v-on="on"
            @click="$router.push('/cmr')"
          >
            <v-icon color="primary">mdi-home</v-icon>
          </v-btn>
        </template>
        <span>Ir para o CMR</span>
      </v-tooltip>
    </span>
    <v-row class="mt-4">
      <v-col>
        <GraphicBar
          v-for="(category, index) in storeCategories"
          :key="index"
          :category="category"
          :max-value="totalValue"
        />
      </v-col>
      <v-col class="d-flex flex-column justify-space-between">
        <CustomDialog
          v-model="showModal"
          title="Novo Usuário"
          max-width="500px"
          :has-cta="true"
          :save-active="newUserFormValid"
          @save="addUser"
        >
          <v-card-text>
            <v-form
              ref="newUserForm"
              v-model="newUserFormValid"
            >
              <v-row
                no-gutters
                class="mx-2"
              >
                <v-col
                  cols="6"
                  class="pr-2"
                >
                  <v-text-field
                    v-model="newUser.username"
                    label="Usuário"
                    outlined
                    :rules="[requiredRule]"
                  />
                </v-col>
                <v-col cols="6">
                  <v-text-field
                    v-model="newUser.first_name"
                    label="Primeiro Nome"
                    outlined
                  />
                </v-col>
                <v-col
                  cols="6"
                  class="pr-2"
                >
                  <v-text-field
                    v-model="newUser.last_name"
                    label="Último Nome"
                    outlined
                  />
                </v-col>
                <v-col cols="6">
                  <v-text-field
                    v-model="newUser.email"
                    label="E-mail"
                    outlined
                    :rules="[requiredRule, emailRule]"
                  />
                </v-col>
                <v-col>
                  <v-select
                    v-model="newUser.institution_id"
                    :label="$t('institution')"
                    :items="$store.state.admin.institutionList"
                    item-text="acronym"
                    outlined
                    item-value="id"
                    :rules="[requiredRule]"
                    required
                  >
                    <template #item="{ item }">
                      <v-tooltip bottom>
                        <template #activator="{ on, attrs }">
                          <v-list-item-content
                            v-bind="attrs"
                            v-on="on"
                          >
                            <v-list-item-title>{{ item.acronym }}</v-list-item-title>
                          </v-list-item-content>
                        </template>
                        <span>{{ item.name }}</span>
                      </v-tooltip>
                    </template>
                  </v-select>
                </v-col>
              </v-row>

              <UserManager
                :available-roles="rolesList"
                :selected-roles="newUser.roles || []"
                :loading="loadingRoles"
                mode="create"
                @add-role="addRoleToNewUser"
                @remove-role="removeRoleFromNewUser"
              />
            </v-form>
          </v-card-text>
        </CustomDialog>

        <CustomDialog
          v-model="showLogsModal"
          title="Logs do Usuário"
          width="1400"
          :has-cta="false"
        >
          <!-- Tabs navigation similar to the image -->
          <v-tabs
            v-model="activeTab"
            color="primary"
            background-color="grey lighten-4"
            show-arrows
          >
            <v-tab class="text-capitalize">
              Dados Cadastrais
            </v-tab>
            <v-tab class="text-capitalize">
              Registro de Acessos do Usuário e seus perfis de Acesso
            </v-tab>
          </v-tabs>

          <v-tabs-items v-model="activeTab">
            <!-- Tab 1: Dados Cadastrais -->
            <v-tab-item>
              <v-card-text>
                <div class="d-flex justify-space-between align-center mb-2">
                  <div class="d-flex align-center">
                    <!-- Search field -->
                    <v-text-field
                      v-model="searchLogs"
                      placeholder="Pesquisar nos dados cadastrais"
                      append-icon="mdi-magnify"
                      clearable
                      dense
                      outlined
                      hide-details
                      style="width: 300px;"
                    />

                    <!-- Export buttons -->
                    <div class="d-flex align-center ml-3">
                      <div class="export-label text-uppercase mr-2">
                        Exportar:
                      </div>
                      <v-tooltip top>
                        <template #activator="{ on, attrs }">
                          <v-btn
                            icon
                            color="#D92B3F"
                            v-bind="attrs"
                            class="mr-2"
                            v-on="on"
                            @click="generateLogsPDF"
                          >
                            <v-icon size="30">
                              mdi-file-pdf-box
                            </v-icon>
                          </v-btn>
                        </template>
                        <span>PDF</span>
                      </v-tooltip>

                      <v-tooltip top>
                        <template #activator="{ on, attrs }">
                          <v-btn
                            icon
                            color="#43A047"
                            v-bind="attrs"
                            @click="generateLogsCSV"
                            v-on="on"
                          >
                            <v-icon size="30">
                              mdi-file-excel-box
                            </v-icon>
                          </v-btn>
                        </template>
                        <span>CSV</span>
                      </v-tooltip>
                    </div>
                  </div>
                </div>

                <v-data-table
                  :headers="logsHeaders"
                  :items="filteredUserLogs"
                  class="elevation-1"
                  dense
                  :search="searchLogs"
                  :items-per-page="10"
                >
                  <template #item.action_time="{ item }">
                    {{ new Date(item.action_time).toLocaleString('pt-BR') }}
                  </template>
                  <template #item.is_active="{ item }">
                    <div class="d-flex align-center">
                      <v-icon
                        :color="item.is_active ? 'green' : 'red'"
                        small
                      >
                        {{ item.is_active ? 'mdi-check-circle' : 'mdi-close-circle' }}
                      </v-icon>
                      <span class="ml-2">{{ item.is_active ? 'Ativo' : 'Inativo' }}</span>
                    </div>
                  </template>
                </v-data-table>

                <div
                  v-if="!userLogs || !userLogs.length"
                  class="text-center mt-4"
                >
                  Nenhum log encontrado para este usuário.
                </div>
              </v-card-text>
            </v-tab-item>

            <!-- Tab 2: Registro de Acessos -->
            <v-tab-item>
              <v-card-text>
                <div class="d-flex justify-space-between align-center mb-2">
                  <div class="d-flex align-center">
                    <!-- Search field -->
                    <v-text-field
                      v-model="searchAccess"
                      placeholder="Pesquisar nos registros de acesso"
                      append-icon="mdi-magnify"
                      clearable
                      dense
                      outlined
                      hide-details
                      style="width: 300px;"
                    />

                    <!-- Export buttons -->
                    <div class="d-flex align-center ml-3">
                      <div class="export-label text-uppercase mr-2">
                        Exportar:
                      </div>
                      <v-tooltip top>
                        <template #activator="{ on, attrs }">
                          <v-btn
                            icon
                            color="#D92B3F"
                            v-bind="attrs"
                            class="mr-2"
                            v-on="on"
                            @click="generateAccessPDF"
                          >
                            <v-icon size="30">
                              mdi-file-pdf-box
                            </v-icon>
                          </v-btn>
                        </template>
                        <span>PDF</span>
                      </v-tooltip>

                      <v-tooltip top>
                        <template #activator="{ on, attrs }">
                          <v-btn
                            icon
                            color="#43A047"
                            v-bind="attrs"
                            @click="generateAccessCSV"
                            v-on="on"
                          >
                            <v-icon size="30">
                              mdi-file-excel-box
                            </v-icon>
                          </v-btn>
                        </template>
                        <span>CSV</span>
                      </v-tooltip>
                    </div>
                  </div>
                </div>

                <!-- Login History Table -->
                <h3 class="mb-3">
                  Histórico de Login
                </h3>
                <v-data-table
                  :headers="loginHeaders"
                  :items="filteredUserLoginHistory"
                  class="elevation-1 mb-6"
                  dense
                  :search="searchAccess"
                  :items-per-page="5"
                >
                  <template #item.last_date_login="{ item }">
                    {{ item.last_date_login }}
                  </template>
                </v-data-table>

                <div
                  v-if="!userLoginHistory.length"
                  class="text-center mb-4"
                >
                  Nenhum histórico de login encontrado.
                </div>

                <!-- Role Changes Table -->
                <h3 class="mb-3">
                  Histórico de Alterações de Perfis de Acesso
                </h3>
                <v-data-table
                  :headers="roleChangesHeaders"
                  :items="filteredUserRoleChanges"
                  class="elevation-1"
                  dense
                  :search="searchAccess"
                  :items-per-page="5"
                >
                  <template #item.changed_at="{ item }">
                    {{ item.changed_at }}
                  </template>
                </v-data-table>

                <div
                  v-if="!userRoleChanges.length"
                  class="text-center mt-4"
                >
                  Nenhuma alteração de grupo encontrada para este usuário.
                </div>
              </v-card-text>
            </v-tab-item>
          </v-tabs-items>
        </CustomDialog>

        <CustomDialog
          v-model="showModalEdit"
          title="Editar Usuário"
          max-width="500px"
          :has-cta="true"
          :save-active="editUserFormValid"
          @save="editUser"
        >
          <v-card-text>
            <v-form
              ref="editUserForm"
              v-model="editUserFormValid"
            >
              <v-row
                no-gutters
                class="pa-0"
              >
                <v-col
                  cols="6"
                  class="pr-2"
                >
                  <v-text-field
                    v-model="editUserData.username"
                    outlined
                    label="Usuário"
                    :rules="[requiredRule]"
                  />
                </v-col>
                <v-col cols="6">
                  <v-text-field
                    v-model="editUserData.first_name"
                    outlined
                    label="Primeiro Nome"
                  />
                </v-col>
                <v-col
                  cols="6"
                  class="pr-2"
                >
                  <v-text-field
                    v-model="editUserData.last_name"
                    outlined
                    label="Último Nome"
                  />
                </v-col>
                <v-col cols="6">
                  <v-text-field
                    v-model="editUserData.email"
                    outlined
                    label="E-mail"
                    :rules="[requiredRule, emailRule]"
                  />
                </v-col>
                <v-col cols="12">
                  <v-select
                    v-model="editUserData.institution_id"
                    :label="$t('institution')"
                    :items="$store.state.admin.institutionList"
                    outlined
                    item-text="acronym"
                    item-value="id"
                    :rules="[requiredRule]"
                    required
                  >
                    <template #item="{ item }">
                      <v-tooltip bottom>
                        <template #activator="{ on, attrs }">
                          <v-list-item-content
                            v-bind="attrs"
                            v-on="on"
                          >
                            <v-list-item-title>{{ item.acronym }}</v-list-item-title>
                          </v-list-item-content>
                        </template>
                        <span>{{ item.name }}</span>
                      </v-tooltip>
                    </template>
                  </v-select>
                </v-col>
                <v-col
                  cols="12"
                  class="d-flex align-center mt-n6"
                >
                  <v-checkbox
                    v-model="editUserData.is_inactive"
                    label="Inativo"
                    density="compact"
                    class="mr-4"
                  />
                  <v-checkbox
                    v-model="editUserData.is_internal"
                    label="Usuário Interno"
                    density="compact"
                  />
                </v-col>
              </v-row>
              <UserManager
                :available-roles="rolesList"
                :selected-roles="editUserData.roles || []"
                mode="edit"
                @add-role="addRoleToUser"
                @remove-role="removeRoleFromUser"
              />
            </v-form>
          </v-card-text>
        </CustomDialog>
      </v-col>
    </v-row>
    <div
      v-if="showFilters"
      class="search mt-4"
    >
      <SearchFiltersUser :filters="filters" />
    </div>

    <div class="d-flex justify-space-between align-center mb-2">
      <div class="d-flex align-center">
        <!-- botão para escolher colunas -->
        <v-menu offset-y>
          <template #activator="{ on, attrs }">
            <v-btn
              text
              small
              v-bind="attrs"
              v-on="on"
            >
              Selecionar colunas
              <v-icon right>
                mdi-chevron-down
              </v-icon>
            </v-btn>
          </template>
          <v-list dense>
            <v-list-item
              v-for="h in headers"
              :key="h.value"
              class="min-height-auto py-1"
            >
              <v-list-item-action class="my-0 mr-2">
                <v-checkbox
                  v-model="visibleColumns"
                  :value="h.value"
                  dense
                  hide-details
                  class="mt-0"
                />
              </v-list-item-action>
              <v-list-item-content class="py-0">
                <v-list-item-title>{{ h.text }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-menu>

        <!-- Pesquisa geral -->
        <v-text-field
          v-model="searchAll"
          placeholder="Pesquisar tudo"
          append-icon="mdi-magnify"
          clearable
          dense
          outlined
          hide-details
          class="ml-4"
          style="width: 350px;"
          @click.stop
        />

        <!-- Export section -->
        <div class="d-flex align-center ml-3">
          <div class="export-label text-uppercase mr-2 text-caption font-weight-bold">
            {{ $t('export') }}
          </div>
          <SavePdfUser :users="filteredByColumns">
            <template #activator="{ on, attrs }">
              <v-tooltip top>
                <template #activator="{ on: tooltipOn, attrs: tooltipAttrs }">
                  <v-btn
                    icon
                    color="#D92B3F"
                    v-bind="{ ...attrs, ...tooltipAttrs }"
                    class="mr-2"
                    v-on="{ ...on, ...tooltipOn }"
                  >
                    <v-icon>mdi-file-pdf-box</v-icon>
                  </v-btn>
                </template>
                <span>PDF</span>
              </v-tooltip>
            </template>
          </SavePdfUser>

          <v-tooltip top>
            <template #activator="{ on, attrs }">
              <v-btn
                icon
                color="#43A047"
                class="mr-2"
                v-bind="attrs"
                @click="generateCSV"
                v-on="on"
              >
                <v-icon size="40">
                  mdi-file-excel-box
                </v-icon>
              </v-btn>
            </template>
            <span>CSV</span>
          </v-tooltip>
        </div>
      </div>

      <!-- Botão adicionar novo usuário -->
      <v-btn
        color="error"
        dark
        rounded
        class="add-user-btn"
        :class="{ 'collapsed': isButtonCollapsed }"
        @click="showModal = true"
        @mouseenter="expandButton"
        @mouseleave="collapseButtonIfNeeded"
      >
        <v-icon>mdi-plus</v-icon>
        <v-slide-x-reverse-transition>
          <span
            v-if="!isButtonCollapsed"
            class="button-text ml-2"
          >
            {{ $t('addNewUser') }}
          </span>
        </v-slide-x-reverse-transition>
      </v-btn>
    </div>

    <div class="table-container">
      <template v-if="loadingUsers">
        <v-skeleton-loader
          v-for="n in 8"
          :key="n"
          type="table-row"
          class="ma-1"
        />
      </template>

      <v-data-table
        v-else-if="filteredUsers.length"
        :headers="filteredHeaders"
        :items="filteredByColumns"
        class="elevation-1"
        dense
        :search="search"
        :height="tableHeight"
        fixed-header
      >
        <!-- Seus templates de header e item permanecem os mesmos -->
        <template #header.username="{ header }">
          <v-menu
            v-model="usernameMenu"
            offset-y
            :close-on-content-click="false"
          >
            <template #activator="{ on, attrs }">
              <v-btn
                text
                small
                v-bind="attrs"
                class="text-capitalize"
                v-on="on"
              >
                {{ header.text }}
                <v-icon
                  small
                  class="ml-1"
                >
                  mdi-filter-variant
                </v-icon>
              </v-btn>
            </template>
            <v-card width="250">
              <v-text-field
                v-model="searchUsername"
                placeholder="Pesquisar..."
                outlined
                dense
                hide-details
                clearable
                class="mx-3 mt-3"
                @click.stop
              />
              <v-divider />
              <v-list
                dense
                class="filter-list"
                style="max-height: 200px; overflow-y: auto;"
              >
                <v-list-item
                  v-for="name in filteredUsernameList"
                  :key="name"
                >
                  <v-checkbox
                    v-model="columnFilters.username"
                    :value="name"
                    :label="name"
                    dense
                    hide-details
                    @change="usernameMenu = false"
                  />
                </v-list-item>
              </v-list>
            </v-card>
          </v-menu>
        </template>

        <!-- First Name Filter -->
        <template #header.first_name="{ header }">
          <v-menu
            v-model="firstNameMenu"
            offset-y
            :close-on-content-click="false"
          >
            <template #activator="{ on, attrs }">
              <v-btn
                text
                small
                v-bind="attrs"
                v-on="on"
              >
                {{ header.text }}<v-icon small>
                  mdi-filter-variant
                </v-icon>
              </v-btn>
            </template>
            <v-card style="width:250px">
              <v-text-field
                v-model="searchFirstName"
                placeholder="Pesquisar..."
                outlined
                dense
                hide-details
                clearable
                class="mx-3 mt-3"
                @click.stop
              />
              <v-divider />
              <v-list
                dense
                class="filter-list"
              >
                <v-list-item
                  v-for="name in filteredFirstNameList"
                  :key="name"
                >
                  <v-checkbox
                    v-model="columnFilters.first_name"
                    :value="name"
                    :label="name"
                    dense
                    @change="firstNameMenu = false"
                  />
                </v-list-item>
              </v-list>
            </v-card>
          </v-menu>
        </template>

        <!-- Last Name Filter -->
        <template #header.last_name="{ header }">
          <v-menu
            v-model="lastNameMenu"
            offset-y
            :close-on-content-click="false"
          >
            <template #activator="{ on, attrs }">
              <v-btn
                text
                small
                v-bind="attrs"
                v-on="on"
              >
                {{ header.text }}<v-icon small>
                  mdi-filter-variant
                </v-icon>
              </v-btn>
            </template>
            <v-card style="width:250px">
              <v-text-field
                v-model="searchLastName"
                placeholder="Pesquisar..."
                outlined
                dense
                hide-details
                clearable
                class="mx-3 mt-3"
                @click.stop
              />
              <v-divider />
              <v-list
                dense
                class="filter-list"
              >
                <v-list-item
                  v-for="name in filteredLastNameList"
                  :key="name"
                >
                  <v-checkbox
                    v-model="columnFilters.last_name"
                    :value="name"
                    :label="name"
                    dense
                    @change="lastNameMenu = false"
                  />
                </v-list-item>
              </v-list>
            </v-card>
          </v-menu>
        </template>

        <!-- Email Filter -->
        <template #header.email="{ header }">
          <v-menu
            v-model="emailMenu"
            offset-y
            :close-on-content-click="false"
          >
            <template #activator="{ on, attrs }">
              <v-btn
                text
                small
                v-bind="attrs"
                v-on="on"
              >
                {{ header.text }}<v-icon small>
                  mdi-filter-variant
                </v-icon>
              </v-btn>
            </template>
            <v-card style="width:250px">
              <v-text-field
                v-model="searchEmail"
                placeholder="Pesquisar..."
                outlined
                dense
                hide-details
                clearable
                class="mx-3 mt-3"
                @click.stop
              />
              <v-divider />
              <v-list
                dense
                class="filter-list"
              >
                <v-list-item
                  v-for="mail in filteredEmailList"
                  :key="mail"
                >
                  <v-checkbox
                    v-model="columnFilters.email"
                    :value="mail"
                    :label="mail"
                    dense
                    @change="emailMenu = false"
                  />
                </v-list-item>
              </v-list>
            </v-card>
          </v-menu>
        </template>

        <!-- Roles Filter -->
        <template #header.roles="{ header }">
          <v-menu
            v-model="rolesMenu"
            offset-y
            :close-on-content-click="false"
          >
            <template #activator="{ on, attrs }">
              <v-btn
                text
                small
                v-bind="attrs"
                v-on="on"
              >
                {{ header.text }}<v-icon small>
                  mdi-filter-variant
                </v-icon>
              </v-btn>
            </template>
            <v-card style="width:250px">
              <v-text-field
                v-model="searchRoles"
                placeholder="Pesquisar..."
                outlined
                dense
                hide-details
                clearable
                class="mx-3 mt-3"
                @click.stop
              />
              <v-divider />
              <v-list
                dense
                class="filter-list"
              >
                <v-list-item
                  v-for="role in filteredRolesList"
                  :key="role"
                >
                  <v-checkbox
                    v-model="columnFilters.roles"
                    :value="role"
                    :label="role"
                    dense
                    @change="rolesMenu = false"
                  />
                </v-list-item>
              </v-list>
            </v-card>
          </v-menu>
        </template>

        <template #item.roles="{ item }">
          <div>
            <span v-if="item.roles && item.roles.length > 0">
              {{ item.roles.map(role => role.name).join(', ') }}
            </span>
            <span v-else>Nenhum perfil associado</span>
          </div>
        </template>

        <!-- Administrator Filter -->
        <template #header.is_admin="{ header }">
          <v-menu offset-y>
            <template #activator="{ on, attrs }">
              <v-btn
                text
                small
                v-bind="attrs"
                v-on="on"
              >
                {{ header.text }}
                <v-icon
                  small
                  class="ml-1"
                >
                  mdi-filter-variant
                </v-icon>
              </v-btn>
            </template>
            <v-list dense>
              <v-list-item>
                <v-checkbox
                  v-model="columnFilters.is_admin"
                  :value="true"
                  label="Sim"
                  dense
                />
              </v-list-item>
              <v-list-item>
                <v-checkbox
                  v-model="columnFilters.is_admin"
                  :value="false"
                  label="Não"
                  dense
                />
              </v-list-item>
            </v-list>
          </v-menu>
        </template>

        <!-- Access Allowed Filter -->
        <template #header.is_active="{ header }">
          <v-menu offset-y>
            <template #activator="{ on, attrs }">
              <v-btn
                text
                small
                v-bind="attrs"
                v-on="on"
              >
                {{ header.text }}
                <v-icon
                  small
                  class="ml-1"
                >
                  mdi-filter-variant
                </v-icon>
              </v-btn>
            </template>
            <v-list dense>
              <v-list-item>
                <v-checkbox
                  v-model="columnFilters.is_active"
                  :value="true"
                  label="Ativo"
                  dense
                />
              </v-list-item>
              <v-list-item>
                <v-checkbox
                  v-model="columnFilters.is_active"
                  :value="false"
                  label="Inativo"
                  dense
                />
              </v-list-item>
            </v-list>
          </v-menu>
        </template>

        <!-- filtro Vínculo Institucional -->
        <template #header.institution="{ header }">
          <v-menu
            v-model="institutionMenu"
            offset-y
            :close-on-content-click="false"
          >
            <template #activator="{ on, attrs }">
              <v-btn
                text
                small
                v-bind="attrs"
                v-on="on"
              >
                {{ header.text }}
                <v-icon
                  small
                  class="ml-1"
                >
                  mdi-filter-variant
                </v-icon>
              </v-btn>
            </template>
            <v-card style="width:250px">
              <v-text-field
                v-model="searchInstitution"
                placeholder="Pesquisar..."
                outlined
                dense
                hide-details
                clearable
                class="mx-3 mt-3"
                @click.stop
              />
              <v-divider />
              <v-list
                dense
                class="filter-list"
              >
                <v-list-item
                  v-for="inst in filteredInstitutionList"
                  :key="inst.id"
                >
                  <v-checkbox
                    v-model="columnFilters.institution"
                    :value="inst.acronym"
                    :label="inst.acronym"
                    dense
                    @change="institutionMenu = false"
                  />
                </v-list-item>
              </v-list>
            </v-card>
          </v-menu>
        </template>

        <template #item.institution="{ item }">
          {{
            item.institution && item.institution.acronym
              ? item.institution.acronym
              : (item.institution && item.institution.name
                ? item.institution.name
                : 'N/A')
          }}
        </template>

        <template #item.actions="{ item }">
          <v-tooltip top>
            <template #activator="{ on, attrs }">
              <v-btn
                icon
                small
                color="grey darken-2"
                v-bind="attrs"
                v-on="on"
                @click="openEditDialog(item)"
              >
                <v-icon>mdi-pencil</v-icon>
              </v-btn>
            </template>
            <span>Editar</span>
          </v-tooltip>
          <v-tooltip top>
            <template #activator="{ on, attrs }">
              <v-btn
                icon
                small
                color="grey darken-2"
                v-bind="attrs"
                v-on="on"
                @click="openLogsDialog(item)"
              >
                <v-icon>mdi-clock-outline</v-icon>
              </v-btn>
            </template>
            <span>Logs</span>
          </v-tooltip>
        </template>

        <template #item.is_active="{ item }">
          <div class="d-flex align-center">
            <v-icon
              :color="item.is_active ? 'green' : 'red'"
              small
            >
              {{ item.is_active ? 'mdi-check-circle' : 'mdi-close-circle' }}
            </v-icon>
            <span class="ml-2">{{ item.is_active ? 'Ativo' : 'Inativo' }}</span>
          </div>
        </template>

        <template #item.is_admin="{ item }">
          <div class="d-flex align-center">
            <v-icon
              :color="item.is_admin ? '#F58A1F' : 'grey'"
              small
            >
              {{ item.is_admin ? 'mdi-account-star' : 'mdi-account' }}
            </v-icon>
            <span class="ml-2">{{ item.is_admin ? 'Sim' : 'Não' }}</span>
          </div>
        </template>
      </v-data-table>
    </div>
  </div>
</template>

<i18n lang="json">
{
  "en": {
    "manageUsers": "Manage Users",
    "addNewUser": "Add new user",
    "export": "Export:",
    "noFileSelected": "No file selected",
    "attachFile": "Attach File",
    "approveRequestCreation": "Approve request upon creation",
    "description": "Description",
    "subject": "Subject",
    "institution": "institution",
    "requestType": "Request Type",
    "field-required": "Field Required",
    "max-characters": "Maximum of {max} characters allowed.",
    "add-user": "User added successfully!",
    "erro-add-user": "Error adding user",
    "changed-user": "User changed successfully!",
    "erro-create-user": "Error creating user"
  },
  "pt-br": {
    "manageUsers": "Gerenciar Usuários",
    "addNewUser": "Adicionar novo usuário",
    "export": "Exportar:",
    "noFileSelected": "Nenhum arquivo selecionado",
    "attachFile": "Anexar Arquivo",
    "approveRequestCreation": "Deferir solicitação na criação",
    "description": "Descrição",
    "subject": "Assunto",
    "institution": "Vínculo Institucional",
    "requestType": "Tipo de Solicitação",
    "field-required": "Campo obrigatório",
    "max-characters": "Máximo de {max} caracteres permitido.",
    "add-user": "Usuário adicionado com sucesso!",
    "erro-add-user": "Erro ao adicionar usuário",
    "changed-user": "Usuário alterado com sucesso!",
    "erro-create-user": "Erro ao criar usuário"
  }
}
</i18n>

<script>
import { mapState, mapActions } from 'vuex';
import GraphicBar from '/components/admin/GraphicBar.vue';
import SearchFiltersUser from '/components/admin/SearchFiltersUser.vue';
import CustomDialog from '/components/admin/CustomDialog.vue';
import SavePdfUser from '/components/admin/SavePdfUser.vue';
import UserManager from '/components/admin/UserManager.vue';

export default {
  name: 'Usuarios',
  components: {
    GraphicBar,
    SearchFiltersUser,
    CustomDialog,
    SavePdfUser,
    UserManager,
  },
  layout: 'admin',

  data() {
    return {
      userLoginHistory: [], // novo array
      showLogsModal: false,
      userLogs: [],
      selectedUserLogs: null,
      search: '',
      showModalEdit: false,
      selectedInstitution: null,
      users: [],
      filteredUsers: [],
      headers: [
        { text: 'Usuário', value: 'username' },
        { text: 'Primeiro Nome', value: 'first_name' },
        { text: 'Último Nome', value: 'last_name' },
        { text: 'Email', value: 'email' },
        { text: 'Administrador', value: 'is_admin' },
        { text: 'Perfil', value: 'roles' },
        { text: 'Acesso Permitido', value: 'is_active' },
        { text: 'Vínculo Institucional', value: 'institution' },
        { text: 'Ações', value: 'actions', align: 'center' },
      ],
      filters: {
        active: false,
        inactive: false,
        adm: false,
        common: false,
      },
      showFilters: false,
      showModal: false,
      formValid: false,
      newUserFormValid: false,
      editUserFormValid: true,
      loadingRoles: false,
      loadingUsers: false,
      newUser: {
        username: '',
        first_name: '',
        last_name: '',
        email: '',
        institution_id: null,
        roles: [],
      },
      editUserData: {
        id: null,
        username: '',
        first_name: '',
        last_name: '',
        email: '',
        institution_id: null,
        is_inactive: false,
        roles: [],
      },
      storeCategories: [
        { label: 'usuários ativos', total: 0, color: '#12A844' },
        { label: 'usuários inativos', total: 0, color: '#D92B3F' },
        { label: 'usuários admin', total: 0, color: '#F58A1F' },
      ],
      requiredRule: (v) => !!v || 'Campo obrigatório',
      emailRule: (v) => /.+@.+\..+/.test(v) || 'E-mail inválido',
      userRoleChanges: [],
      visibleColumns: ['username', 'email', 'roles', 'is_admin', 'is_active', 'institution', 'actions'],
      columnFilters: {
        is_admin: [], // [true, false]
        is_active: [], // [true, false]
        institution: [],
        username: [],
        first_name: [],
        last_name: [],
        email: [],
        roles: [],
      },
      searchInstitution: '',
      institutionMenu: false,
      usernameMenu: false,
      firstNameMenu: false,
      lastNameMenu: false,
      emailMenu: false,
      rolesMenu: false,
      searchUsername: '',
      searchFirstName: '',
      searchLastName: '',
      searchEmail: '',
      searchRoles: '',
      searchAll: '',
      isButtonCollapsed: true,
      buttonCollapseTimeout: null,
      activeTab: 0,
      searchLogs: '',
      searchAccess: '',
      tableHeight: 'calc(100vh - 350px)',

      logsHeaders: [
        { text: 'Alterado por', value: 'alterado_por' },
        { text: 'Alterado em', value: 'action_time' },
        { text: 'Nome', value: 'username' },
        { text: 'Email', value: 'email' },
        { text: 'Vínculo Institucional', value: 'institution' },
        { text: 'Status', value: 'is_active' },
      ],

      loginHeaders: [
        { text: 'Data de Login', value: 'last_date_login' },
        { text: 'IP', value: 'ip' },
        { text: 'Localização', value: 'location' },
        { text: 'Dispositivo', value: 'type_device' },
        { text: 'Navegador', value: 'browser' },
        { text: 'Latitude', value: 'latitude' },
        { text: 'Longitude', value: 'longitude' },
      ],

      roleChangesHeaders: [
        { text: 'Alterado Por', value: 'changed_by' },
        { text: 'Data/Hora', value: 'changed_at' },
        { text: 'Ação', value: 'action' },
        { text: 'Perfil', value: 'role' },
      ],
    };
  },

  computed: {
    totalValue() {
      return this.storeCategories.reduce(
        (acc, category) => acc + category.total,
        0,
      );
    },

    filteredHeaders() {
      return this.headers.filter((h) => this.visibleColumns.includes(h.value));
    },

    filteredByColumns() {
      return this.filteredUsers.filter((user) => Object.entries(
        this.columnFilters,
      ).every(([col, vals]) => {
        if (!vals.length) return true;

        if (col === 'institution') {
          const userInstitutionAcronym = user.institution && user.institution.acronym
            ? user.institution.acronym
            : 'N/A';
          return vals.includes(userInstitutionAcronym);
        }

        if (col === 'roles') {
          const userRoleNames = (user.roles || []).map((role) => role.name);
          return vals.some((role) => userRoleNames.includes(role));
        }

        return vals.includes(user[col]);
      }));
    },

    filteredInstitutionList() {
      const term = (this.searchInstitution || '').toLowerCase();
      return this.institutionList.filter((inst) => (
        (inst.acronym && inst.acronym.toLowerCase().includes(term))
        || (inst.name && inst.name.toLowerCase().includes(term))
      ));
    },

    filteredUsernameList() {
      const term = (this.searchUsername || '').toLowerCase();
      return [...new Set(this.filteredUsers.map((u) => u.username))]
        .filter((v) => v.toLowerCase().includes(term));
    },

    filteredEmailList() {
      const term = (this.searchEmail || '').toLowerCase();
      return [...new Set(this.filteredUsers.map((u) => u.email))]
        .filter((v) => v.toLowerCase().includes(term));
    },

    filteredFirstNameList() {
      const term = (this.searchFirstName || '').toLowerCase();
      return [...new Set(this.filteredUsers.map((u) => u.first_name || '').filter((v) => v))]
        .filter((v) => v.toLowerCase().includes(term));
    },

    filteredLastNameList() {
      const term = (this.searchLastName || '').toLowerCase();
      return [...new Set(this.filteredUsers.map((u) => u.last_name || '').filter((v) => v))]
        .filter((v) => v.toLowerCase().includes(term));
    },

    filteredRolesList() {
      const term = (this.searchRoles || '').toLowerCase();
      const allRoles = [...new Set(
        this.filteredUsers
          .flatMap((u) => u.roles || [])
          .map((role) => role.name)
          .filter((name) => name),
      )];
      return allRoles.filter((name) => name.toLowerCase().includes(term));
    },

    filteredUserLogs() {
      return this.userLogs || [];
    },

    filteredUserLoginHistory() {
      return this.userLoginHistory || [];
    },

    filteredUserRoleChanges() {
      return this.userRoleChanges || [];
    },

    ...mapState('admin', ['institutionList', 'rolesList']),
  },

  watch: {
    searchAll(val) {
      this.search = val;
    },
  },

  async mounted() {
    await this.fetchInstitutionList();
    await this.fetchRoles();
    this.fetchUsers();

    // Start with button expanded for 2 seconds, then collapse
    this.isButtonCollapsed = false;
    setTimeout(() => {
      this.isButtonCollapsed = true;
    }, 2000);
  },

  methods: {
    parseChangedFields(changeMessage) {
      try {
        const parsed = JSON.parse(changeMessage);
        if (Array.isArray(parsed) && parsed[0] && parsed[0].changed && parsed[0].changed.fields) {
          return parsed[0].changed.fields;
        }
        return [];
      } catch (e) {
        return [];
      }
    },
    async openLogsDialog(user) {
      this.selectedUserLogs = user;
      this.showLogsModal = true;

      try {
        const [logsResponse, loginResponse, roleChangesResponse] = await Promise.all([
          this.$api.get(`/history/logs/?user_id=${user.id}`),
          this.$api.get(`/dashboard/?user=${user.id}`),
          this.$api.get(`/history/role-changes/?user_id=${user.id}`),
        ]);

        this.userLogs = logsResponse.data;
        this.userLoginHistory = loginResponse.data;
        this.userRoleChanges = roleChangesResponse.data;
      } catch (e) {
        this.userLogs = [];
        this.userLoginHistory = [];
        this.userRoleChanges = [];
      }
    },
    async fetchRoles() {
      try {
        this.loadingRoles = true;
        const response = await this.$api.get('/user/role/');
        this.$store.commit('admin/setRolesList', response.data);
      } catch (error) {
        console.error('Erro ao carregar roles:', error);
        this.$store.commit('alert/addAlert', {
          timeout: 5000,
          message: 'Erro ao carregar perfis',
        });
      } finally {
        this.loadingRoles = false;
      }
    },

    applyFilters(filters) {
      this.filters = filters;
      this.filterUsers();
    },

    filterUsers() {
      this.filteredUsers = this.users.filter((user) => {
        const matchesActive = this.filters.active
          ? user.is_active
          : true;
        const matchesInactive = this.filters.inactive
          ? !user.is_active
          : true;
        const matchesAdm = this.filters.adm ? user.is_admin : true;
        const matchesCommon = this.filters.common
          ? !user.is_admin
          : true;
        return (
          matchesActive
                    && matchesInactive
                    && matchesAdm
                    && matchesCommon
        );
      });
    },

    async fetchUsers() {
      this.loadingUsers = true;
      try {
        const response = await this.$api.get('/user/');
        if (Array.isArray(response.data) && response.data.length > 0) {
          this.users = response.data;
          this.filteredUsers = this.users;
          this.updateStoreCategories();
        } else {
          console.warn('Nenhum usuário encontrado.');
        }
      } catch (error) {
        console.error('Erro ao buscar usuários:', error);
      } finally {
        this.loadingUsers = false;
      }
    },

    updateStoreCategories() {
      const activeUsers = this.users.filter(
        (user) => user.is_active,
      ).length;
      const inactiveUsers = this.users.filter(
        (user) => !user.is_active,
      ).length;
      const adminUser = this.users.filter((user) => user.is_admin).length;
      this.storeCategories[0].total = activeUsers;
      this.storeCategories[1].total = inactiveUsers;
      this.storeCategories[2].total = adminUser;
    },

    addRoleToNewUser(role) {
      if (!this.newUser.roles) {
        this.$set(this.newUser, 'roles', []);
      }
      if (!this.newUser.roles.some((r) => r.id === role.id)) {
        this.newUser.roles.push(role);
      }
    },

    removeRoleFromNewUser(role) {
      this.newUser.roles = this.newUser.roles.filter((r) => r.id !== role.id);
    },

    addRoleToUser(role) {
      if (!this.editUserData.roles.some((r) => r.id === role.id)) {
        this.editUserData.roles = [...this.editUserData.roles, role];
      }
    },

    removeRoleFromUser(role) {
      this.editUserData.roles = this.editUserData.roles.filter((r) => r.id !== role.id);
    },

    async addUser() {
      try {
        const payload = {
          username: this.newUser.username,
          first_name: this.newUser.first_name,
          last_name: this.newUser.last_name,
          email: this.newUser.email,
          institution_id: this.newUser.institution_id,
          roles: this.newUser.roles.map((role) => role.id),
        };

        const response = await this.$api.post('/user/', payload);

        if (response.status === 201) {
          this.showModal = false;
          this.fetchUsers();
          this.resetForm();

          // Notificação de sucesso detalhada
          this.$store.commit('alert/addAlert', {
            timeout: 5000,
            message: `Usuário "${this.newUser.username}" foi criado com sucesso! ${this.newUser.roles.length > 0 ? `Perfis atribuídos: ${this.newUser.roles.map((r) => r.name).join(', ')}.` : ''}`,
          });
        }
      } catch (error) {
        console.error('Erro ao criar usuário:', error);

        let errorMessage = 'Erro ao criar usuário.';
        if (error.response && error.response.data) {
          if (error.response.data.email && error.response.data.email.includes('already exists')) {
            errorMessage = 'Este e-mail já está sendo usado por outro usuário.';
          } else if (error.response.data.username && error.response.data.username.includes('already exists')) {
            errorMessage = 'Este nome de usuário já está sendo usado.';
          } else if (error.response.data.detail) {
            errorMessage = error.response.data.detail;
          }
        }

        this.$store.commit('alert/addAlert', {
          timeout: 5000,
          message: errorMessage,
        });
      }
    },

    resetForm() {
      this.newUser = {
        username: '',
        first_name: '',
        last_name: '',
        email: '',
        institution_id: null,
        roles: [],
      };
      this.editUserData = {
        id: null,
        username: '',
        first_name: '',
        last_name: '',
        email: '',
        institution_id: null,
        is_inactive: false,
        roles: [],
      };
      this.selectedInstitution = null;
      if (this.$refs.newUserForm) {
        this.$refs.newUserForm.resetValidation();
      }
      if (this.$refs.editUserForm) {
        this.$refs.editUserForm.resetValidation();
      }
      this.newUserFormValid = false;
      this.editUserFormValid = true;
    },

    async editUser() {
      try {
        if (!this.editUserData.id) {
          throw new Error('ID do usuário não definido.');
        }

        const payload = {
          username: this.editUserData.username,
          first_name: this.editUserData.first_name,
          last_name: this.editUserData.last_name,
          email: this.editUserData.email,
          institution_id: this.editUserData.institution_id,
          is_active: !this.editUserData.is_inactive,
          roles: this.editUserData.roles.map((role) => role.id),
        };

        const response = await this.$api.patch(
          `/user/${this.editUserData.id}/`,
          payload,
        );

        if (response.status === 200) {
          this.showModalEdit = false;
          this.fetchUsers();
          this.resetForm();

          this.$store.commit('alert/addAlert', {
            timeout: 5000,
            message: `Usuário "${this.editUserData.username}" foi atualizado com sucesso! ${this.editUserData.roles.length > 0 ? `Perfis: ${this.editUserData.roles.map((r) => r.name).join(', ')}.` : 'Nenhum perfil atribuído.'}`,
          });
        } else {
          throw new Error('Resposta inesperada da API.');
        }
      } catch (error) {
        console.error('Erro ao editar usuário:', error);

        let errorMessage = 'Erro ao atualizar usuário.';
        if (error.response && error.response.data) {
          if (error.response.data.email && error.response.data.email.includes('already exists')) {
            errorMessage = 'Este e-mail já está sendo usado por outro usuário.';
          } else if (error.response.data.username && error.response.data.username.includes('already exists')) {
            errorMessage = 'Este nome de usuário já está sendo usado.';
          } else if (error.response.data.detail) {
            errorMessage = error.response.data.detail;
          }
        }

        this.$store.commit('alert/addAlert', {
          timeout: 5000,
          message: errorMessage,
        });
      }
    },

    async openEditDialog(user) {
      try {
        const [userResponse, rolesResponse] = await Promise.all([
          this.$api.get(`/user/${user.id}/`),
          this.$api.get('/user/role/'),
        ]);

        const userData = userResponse.data;
        const rolesList = rolesResponse.data;

        this.editUserData = {
          id: userData.id,
          username: userData.username,
          first_name: userData.first_name,
          last_name: userData.last_name,
          email: userData.email,
          institution_id: userData.institution_id,
          is_inactive: !userData.is_active,
          is_internal: user.is_internal,
          roles: userData.roles || [],
        };

        this.$store.commit('admin/setRolesList', rolesList);

        this.showModalEdit = true;
        this.editUserFormValid = true;
      } catch (error) {
        console.error('Erro ao buscar dados:', error);

        this.editUserData = {
          id: user.id,
          username: user.username,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          institution_id: user.institution_id,
          is_inactive: !user.is_active,
          roles: user.roles || [],
        };
        this.showModalEdit = true;
        this.editUserFormValid = true;
      }
    },

    async generateCSV() {
      try {
        this.loadingUsers = true;

        const headers = [
          'Usuário',
          'Primeiro Nome',
          'Último Nome',
          'Email',
          'Administrador',
          'Acesso Permitido',
          'Vínculo Institucional',
          'Data de Criação',
          'Último Login',
        ];

        const rows = this.filteredByColumns.map((user) => [
          user.username || '',
          user.first_name || '',
          user.last_name || '',
          user.email || '',
          user.is_admin ? 'Sim' : 'Não',
          user.is_active ? 'Ativo' : 'Inativo',
          this.getInstitutionDisplay(user),
          this.formatDate(user.date_joined),
          this.formatDate(user.last_login),
        ]);

        const result = await this.$downloader.csv(rows, headers, 'usuarios', {
          delimiter: ',',
          dateFormat: 'iso',
          includeTimestamp: true,
        });

        this.$store.commit('alert/addAlert', {
          timeout: 3000,
          message: `✅ Arquivo CSV exportado com sucesso! (${result.recordCount} usuários)`,
          type: 'success',
        });
      } catch (error) {
        console.error('Erro ao gerar CSV:', error);

        this.$store.commit('alert/addAlert', {
          timeout: 5000,
          message: `❌ ${error.message || 'Erro ao exportar arquivo CSV. Tente novamente.'}`,
          type: 'error',
        });
      } finally {
        this.loadingUsers = false;
      }
    },

    getInstitutionDisplay(user) {
      if (user.institution) {
        if (user.institution.acronym) {
          return user.institution.acronym;
        }
        if (user.institution.name) {
          return user.institution.name;
        }
        if (typeof user.institution === 'string') {
          return user.institution;
        }
      }
      return 'N/A';
    },

    formatDate(dateString) {
      if (!dateString) return 'N/A';
      try {
        return new Date(dateString).toLocaleString('pt-BR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        });
      } catch (error) {
        return 'Data inválida';
      }
    },

    expandButton() {
      if (this.buttonCollapseTimeout) {
        clearTimeout(this.buttonCollapseTimeout);
        this.buttonCollapseTimeout = null;
      }
      this.isButtonCollapsed = false;
    },

    collapseButtonIfNeeded() {
      this.buttonCollapseTimeout = setTimeout(() => {
        this.isButtonCollapsed = true;
      }, 500);
    },

    async generateLogsPDF() {
      try {
        if (!this.filteredUserLogs || this.filteredUserLogs.length === 0) {
          this.$store.commit('alert/addAlert', {
            timeout: 3000,
            message: 'Nenhum log encontrado para exportar.',
            type: 'warning',
          });
          return;
        }

        const headers = ['Alterado por', 'Alterado em', 'Nome', 'Email', 'Vínculo Institucional', 'Status'];
        const data = this.filteredUserLogs.map((log) => ({
          'Alterado por': log.alterado_por || 'N/A',
          'Alterado em': this.formatDate(log.action_time),
          Nome: log.username || 'N/A',
          Email: log.email || 'N/A',
          'Vínculo Institucional': log.institution || 'N/A',
          Status: log.is_active ? 'Ativo' : 'Inativo',
        }));

        const username = (this.selectedUserLogs && this.selectedUserLogs.username) || 'usuario';
        const filename = this.$downloader.generateFileName(`dados_cadastrais_${username}`, 'pdf', {
          includeTimestamp: true,
          dateFormat: 'iso',
        });

        await this.$downloader.downloadPDF(
          data,
          headers,
          `Dados Cadastrais do Usuário: ${(this.selectedUserLogs && this.selectedUserLogs.username) || 'N/A'}`,
          filename,
        );
      } catch (error) {
        console.error('Erro ao gerar PDF dos logs:', error);
        this.$store.commit('alert/addAlert', {
          timeout: 5000,
          message: 'Erro ao exportar PDF. Tente novamente.',
          type: 'error',
        });
      }
    },

    async generateLogsCSV() {
      try {
        const headers = ['Alterado por', 'Alterado em', 'Nome', 'Email', 'Vínculo Institucional', 'Status'];
        const rows = this.filteredUserLogs.map((log) => [
          log.alterado_por || 'N/A',
          this.formatDate(log.action_time),
          log.username || 'N/A',
          log.email || 'N/A',
          log.institution || 'N/A',
          log.is_active ? 'Ativo' : 'Inativo',
        ]);

        const username = (this.selectedUserLogs && this.selectedUserLogs.username) || 'usuario';
        const baseName = `dados_cadastrais_${username}`;

        const result = await this.$downloader.csv(rows, headers, baseName, {
          delimiter: ',',
          dateFormat: 'iso',
          includeTimestamp: true,
        });

        this.$store.commit('alert/addAlert', {
          timeout: 3000,
          message: `✅ CSV dos dados cadastrais exportado com sucesso! (${result.recordCount} registros)`,
          type: 'success',
        });
      } catch (error) {
        console.error('Erro ao gerar CSV dos logs:', error);
        this.$store.commit('alert/addAlert', {
          timeout: 5000,
          message: `❌ ${error.message || 'Erro ao exportar CSV. Tente novamente.'}`,
          type: 'error',
        });
      }
    },

    async generateAccessPDF() {
      try {
        const loginData = this.filteredUserLoginHistory.map((login) => ({
          'Data de Login': login.last_date_login,
          IP: login.ip,
          Localização: login.location,
          Dispositivo: login.type_device,
          Navegador: login.browser,
        }));

        const roleData = this.filteredUserRoleChanges.map((change) => ({
          'Alterado Por': change.changed_by,
          'Data/Hora': change.changed_at,
          Ação: change.action,
          Perfil: change.role,
        }));

        const combinedData = [
          ...loginData.map((item) => ({ ...item, _section: 'login' })),
          ...roleData.map((item) => ({ ...item, _section: 'roles' })),
        ];

        const allHeaders = ['Data de Login', 'IP', 'Localização', 'Dispositivo', 'Navegador', 'Alterado Por', 'Data/Hora', 'Ação', 'Perfil'];

        const filename = this.$downloader.generateFileName('registro_acessos_usuario', 'pdf', {
          includeTimestamp: true,
          dateFormat: 'iso',
        });

        await this.$downloader.downloadPDF(combinedData, allHeaders, 'Registro de Acessos do Usuário', filename);
      } catch (error) {
        console.error('Erro ao gerar PDF:', error);
      }
    },

    async generateAccessCSV() {
      try {
        const loginHeaders = ['Data de Login', 'IP', 'Localização', 'Dispositivo', 'Navegador', 'Latitude', 'Longitude'];
        const loginRows = this.filteredUserLoginHistory.map((login) => [
          login.last_date_login,
          login.ip,
          login.location,
          login.type_device,
          login.browser,
          login.latitude,
          login.longitude,
        ]);

        const roleHeaders = ['Alterado Por', 'Data/Hora', 'Ação', 'Perfil'];
        const roleRows = this.filteredUserRoleChanges.map((change) => [
          change.changed_by,
          change.changed_at,
          change.action,
          change.role,
        ]);

        const loginCsvContent = this.$downloader.convertToCSV(loginRows, loginHeaders);
        const roleCsvContent = this.$downloader.convertToCSV(roleRows, roleHeaders);

        const combinedCsvContent = `HISTÓRICO DE LOGIN\n${loginCsvContent}\n\nHISTÓRICO DE ALTERAÇÕES DE PAPÉIS\n${roleCsvContent}`;

        const filename = this.$downloader.generateFileName('registro_acessos_usuario', 'csv', {
          includeTimestamp: true,
          dateFormat: 'iso',
        });

        this.$downloader.downloadCSV(combinedCsvContent, filename);
      } catch (error) {
        console.error('Erro ao gerar CSV de acessos:', error);
        this.$store.commit('alert/addAlert', {
          timeout: 5000,
          message: 'Erro ao exportar CSV de acessos. Tente novamente.',
          type: 'error',
        });
      }
    },

    ...mapActions('admin', ['fetchInstitutionList']),
  },
};
</script>

<style lang="sass" scoped>
.user
  height: 100vh
  overflow: hidden
  width: 100%
  padding: 2rem

.table-container
  height: calc(100vh - 300px)
  overflow: hidden
  position: relative

// Estilos mínimos necessários para o botão animado
.add-user-btn
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)
  overflow: hidden
  white-space: nowrap

  &.collapsed
    min-width: 40px !important

.button-text
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)

// Estilo para a área de exportação
.export-label
  letter-spacing: 0.5px
</style>
