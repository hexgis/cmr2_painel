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
          :save-active="formValid"
          @save="addUser"
        >
          <v-card-text>
            <v-form
              ref="form"
              v-model="formValid"
            >
              <v-row class="pa-3">
                <v-text-field
                  v-model="newUser.username"
                  label="Usuário"
                  outlined
                  :rules="[requiredRule]"
                />
                <v-spacer />
                <v-text-field
                  v-model="newUser.first_name"
                  label="Primeiro Nome"
                  outlined
                />
              </v-row>
              <v-row class="pa-3">
                <v-text-field
                  v-model="newUser.last_name"
                  label="Último Nome"
                  outlined
                />
                <v-spacer />
                <v-text-field
                  v-model="newUser.email"
                  label="E-mail"
                  outlined
                  :rules="[requiredRule, emailRule]"
                />
              </v-row>
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

              <UserManager
                :available-roles="rolesList"
                :selected-roles="newUser.roles || []"
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
              Registro de Acessos do Usuário e seus Papéis de Acesso
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
                  Histórico de Alterações de Papéis de Acesso
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
          :save-active="formValid"
          @save="editUser"
        >
          <v-card-text>
            <v-form
              ref="form"
              v-model="formValid"
            >
              <v-row class="pa-3">
                <v-text-field
                  v-model="editUserData.username"
                  outlined
                  label="Usuário"
                  :rules="[requiredRule]"
                />
                <v-spacer />
                <v-text-field
                  v-model="editUserData.first_name"
                  outlined
                  label="Primeiro Nome"
                />
              </v-row>
              <v-row class="pa-3">
                <v-text-field
                  v-model="editUserData.last_name"
                  outlined
                  label="Último Nome"
                />
                <v-spacer />
                <v-text-field
                  v-model="editUserData.email"
                  outlined
                  label="E-mail"
                  :rules="[requiredRule, emailRule]"
                />
              </v-row>
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
              <v-checkbox
                v-model="editUserData.is_inactive"
                label="Inativo"
                class="mt-n2"
              />
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
            >
              <v-list-item-action>
                <v-checkbox
                  v-model="visibleColumns"
                  :value="h.value"
                  dense
                  hide-details
                />
              </v-list-item-action>
              <v-list-item-content>
                <v-list-item-title>{{ h.text }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-menu>

        <!-- pesquisa geral -->
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
          <!-- Export icons -->
          <div class="export-icons">
            <div class="export-label text-uppercase mr-2">
              {{ $t('export') }}
            </div>
            <SavePdfUser :users="filteredByColumns">
              <template #activator="{ on, attrs }">
                <v-btn
                  icon
                  color="#D92B3F"
                  v-bind="attrs"
                  class="mr-2"
                  v-on="on"
                >
                  <v-icon>mdi-file-pdf-box</v-icon>
                </v-btn>
              </template>
            </SavePdfUser>

            <v-tooltip top>
              <template #activator="{ on, attrs }">
                <v-btn
                  icon
                  color="#43A047"
                  class="mr-3"
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
      </div>

      <!-- botão adicionar novo usuário -->
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
        <span class="button-text ml-2">{{ $t('addNewUser') }}</span>
      </v-btn>
    </div>

    <v-data-table
      v-if="filteredUsers.length"
      :headers="filteredHeaders"
      :items="filteredByColumns"
      class="elevation-1 mt-4"
      dense
      :search="search"
    >
      <!-- Name Filter -->
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
              v-on="on"
            >
              {{ header.text }}<v-icon small>
                mdi-filter-variant
              </v-icon>
            </v-btn>
          </template>
          <v-card style="width:250px">
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
</template>

<i18n>
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
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
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
      showLogsModal: false,
      userLogs: [],
      selectedUserLogs: null,
      headers: [
        { text: 'Usuário', value: 'username' },
        { text: 'Primeiro Nome', value: 'first_name' },
        { text: 'Último Nome', value: 'last_name' },
        { text: 'Email', value: 'email' },
        { text: 'Administrador', value: 'is_admin' },
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
      },
      storeCategories: [
        { label: 'usuários ativos', total: 0, color: '#12A844' },
        { label: 'usuários inativos', total: 0, color: '#D92B3F' },
        { label: 'usuários admin', total: 0, color: '#F58A1F' },
      ],
      requiredRule: (v) => !!v || 'Campo obrigatório',
      emailRule: (v) => /.+@.+\..+/.test(v) || 'E-mail inválido',
      userRoleChanges: [],
      visibleColumns: ['username', 'email', 'is_admin', 'is_active', 'institution', 'actions'],
      columnFilters: {
        is_admin: [], // [true, false]
        is_active: [], // [true, false]
        institution: [],
        username: [],
        first_name: [],
        last_name: [],
        email: [],
      },
      searchInstitution: '',
      institutionMenu: false,
      usernameMenu: false,
      firstNameMenu: false,
      lastNameMenu: false,
      emailMenu: false,
      searchUsername: '',
      searchFirstName: '',
      searchLastName: '',
      searchEmail: '',
      searchAll: '',
      isButtonCollapsed: true,
      buttonCollapseTimeout: null,
      activeTab: 0,
      searchLogs: '',
      searchAccess: '',

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
        { text: 'Papel', value: 'role' },
      ],
    };
  },

  watch: {
    searchAll(val) {
      this.search = val;
    },
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
      return this.filteredUsers.filter((user) => Object.entries(this.columnFilters).every(([col, vals]) => {
        if (!vals.length) return true;

        if (col === 'institution') {
          const userInstitutionAcronym = user.institution && user.institution.acronym ? user.institution.acronym : 'N/A';
          return vals.includes(userInstitutionAcronym);
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
          this.$api.get(`/dashboard/get-user-login/?user_id=${user.id}`),
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
        const response = await this.$api.get('/user/role/');
        this.$store.commit('admin/setRolesList', response.data);
      } catch (error) {
        console.error('Erro ao carregar roles:', error);
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
          this.$store.commit('alert/addAlert', {
            timeout: 3000,
            message: this.$t('add-user'),
          });
        }
      } catch (error) {
        console.error('Erro ao criar usuário:', error);
        this.$store.commit('alert/addAlert', {
          timeout: 3000,
          message: this.$t('erro-add-user'),
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
      this.$refs.form.resetValidation();
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
            timeout: 3000,
            message: this.$t('changed-user'),
          });
        } else {
          throw new Error('Resposta inesperada da API.');
        }
      } catch (error) {
        console.error('Erro ao editar usuário:', error);
        this.$store.commit('alert/addAlert', {
          timeout: 3000,
          message: this.$t('erro-create-user'),
        });
      }
    },

    async openEditDialog(user) {
      try {
      // Busca os dados do usuário e as roles disponíveis simultaneamente
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
          roles: userData.roles || [],
        };

        // Atualiza a lista de roles disponíveis no store
        this.$store.commit('admin/setRolesList', rolesList);

        this.showModalEdit = true;
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
      }
    },

    generateCSV() {
      // Cabeçalho do CSV
      const headers = ['Usuário', 'Primeiro Nome', 'Último Nome', 'Email', 'Administrador', 'Acesso Permitido', 'Vínculo Institucional'];
      const rows = this.filteredByColumns.map((user) => [
        user.username,
        user.first_name || '',
        user.last_name || '',
        user.email,
        user.is_admin ? 'Sim' : 'Não',
        user.is_active ? 'Ativo' : 'Inativo',
        user.institution && user.institution.acronym ? user.institution.acronym : user.institution || '',
      ]);
      const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'usuarios.csv';
      link.click();
      URL.revokeObjectURL(link.href);
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

    generateLogsPDF() {
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      doc.setFontSize(12);
      doc.text('Dados Cadastrais do Usuário', 15, 20);

      autoTable(doc, {
        startY: 30,
        head: [['Alterado por', 'Alterado em', 'Nome', 'Email', 'Vínculo Institucional', 'Status']],
        body: this.filteredUserLogs.map((log) => [
          log.alterado_por,
          new Date(log.action_time).toLocaleString('pt-BR'),
          log.username,
          log.email,
          log.institution,
          log.is_active ? 'Ativo' : 'Inativo',
        ]),
        headStyles: {
          fillColor: '#D92B3F',
          textColor: [255, 255, 255],
        },
      });

      doc.save('dados_cadastrais_usuario.pdf');
    },

    generateLogsCSV() {
      const headers = ['Alterado por', 'Alterado em', 'Nome', 'Email', 'Vínculo Institucional', 'Status'];
      const rows = this.filteredUserLogs.map((log) => [
        log.alterado_por,
        new Date(log.action_time).toLocaleString('pt-BR'),
        log.username,
        log.email,
        log.institution,
        log.is_active ? 'Ativo' : 'Inativo',
      ]);
      const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'dados_cadastrais_usuario.csv';
      link.click();
      URL.revokeObjectURL(link.href);
    },

    generateAccessPDF() {
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      doc.setFontSize(12);
      doc.text('Registro de Acessos do Usuário', 15, 20);

      // Login History
      autoTable(doc, {
        startY: 30,
        head: [['Data de Login', 'IP', 'Localização', 'Dispositivo', 'Navegador']],
        body: this.filteredUserLoginHistory.map((login) => [
          login.last_date_login,
          login.ip,
          login.location,
          login.type_device,
          login.browser,
        ]),
        headStyles: {
          fillColor: '#D92B3F',
          textColor: [255, 255, 255],
        },
      });

      // Role Changes
      const finalY = doc.lastAutoTable.finalY + 20;
      doc.text('Histórico de Alterações de Papéis', 15, finalY);

      autoTable(doc, {
        startY: finalY + 10,
        head: [['Alterado Por', 'Data/Hora', 'Ação', 'Papel']],
        body: this.filteredUserRoleChanges.map((change) => [
          change.changed_by,
          change.changed_at,
          change.action,
          change.role,
        ]),
        headStyles: {
          fillColor: '#D92B3F',
          textColor: [255, 255, 255],
        },
      });

      doc.save('registro_acessos_usuario.pdf');
    },

    generateAccessCSV() {
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

      const roleHeaders = ['Alterado Por', 'Data/Hora', 'Ação', 'Papel'];
      const roleRows = this.filteredUserRoleChanges.map((change) => [
        change.changed_by,
        change.changed_at,
        change.action,
        change.role,
      ]);

      const csvContent = [
        'HISTÓRICO DE LOGIN',
        loginHeaders.join(','),
        ...loginRows.map((row) => row.join(',')),
        '',
        'HISTÓRICO DE ALTERAÇÕES DE PAPÉIS',
        roleHeaders.join(','),
        ...roleRows.map((row) => row.join(',')),
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'registro_acessos_usuario.csv';
      link.click();
      URL.revokeObjectURL(link.href);
    },

    ...mapActions('admin', ['fetchInstitutionList']),
  },
};
</script>

<style lang="sass" scoped>
.line-separator
    border: 1px solid #9A9997
    margin: 1rem 0

.user
    height: 100vh
    overflow-y: auto
    width: 100%
    padding: 2rem

.styled-btn
    padding: 1rem 1rem 0
    border-radius: 8px

.styled-btn:hover
    opacity: 0.8

.card--wrapper
    display: grid
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr))
    gap: 1rem

.wrapper
    display: flex
    flex-direction: row
    align-items: center
    justify-content: space-between

.filter-list
    max-height: 200px
    overflow-y: auto

.export-container
    display: flex
    flex-direction: column
    align-items: flex-end // Align items to the right
    margin-top: 1rem
    margin-bottom: 1rem

.export-label
    // text-transform: uppercase // Already applied via class
    // font-weight: bold // Already applied via class
    letter-spacing: 0.5px // Adjusted for better visual
    margin-bottom: 0.5rem // Space between label and buttons
    font-size: 0.8rem // Slightly smaller label
    display: flex
    align-items: center

.export-actions
    display: flex
    gap: 0.5rem // Reduced gap for closer buttons

.export-btn
    min-width: 80px // Ensure buttons have a decent size
    min-height: 80px // Ensure buttons have a decent size
    padding: 0 !important // Remove default padding to center icon
    display: flex
    align-items: center
    justify-content: center
    border-radius: 8px // Rounded corners for buttons
    i // Icon styling
      font-size: 2rem // Ensure icons are large enough
      line-height: 1 // Ensure icon is centered vertically

.pdf-btn
    background-color: #D9534F !important // Bootstrap's btn-danger color
    color: #fff

.csv-btn
    background-color: #5CB85C !important // Bootstrap's btn-success color
    color: #fff

.add-user-btn
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)
  overflow: hidden
  white-space: nowrap
  min-width: 40px
  padding: 8px 16px

  .button-text
    transition: opacity 0.4s cubic-bezier(0.25, 0.8, 0.25, 1), transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1), margin 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)
    opacity: 1
    transform: translateX(0)
    margin-left: 8px

  &.collapsed
    padding: 8px

    .button-text
      opacity: 0
      width: 0
      margin: 0
      transform: translateX(-20px)
      margin-left: 0

.export-icons
  display: flex
  align-items: center
  gap: 0.25rem
</style>
