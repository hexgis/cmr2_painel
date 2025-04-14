<template>
  <div>
    <HeroBanner
      :hero-title="$t('hero-title')"
      background-image="/img/portal/banner-contato.jpg"
      :has-c-t-a="false"
    />
    <div class="content mx-auto px-8 px-lg-0">
      <v-row>
        <v-col
          cols="12"
          md="6"
        >
          <h2>{{ $t('contact-title') }}</h2>
          <p>{{ $t('contact-description') }}</p>
        </v-col>
        <v-col
          cols="12"
          md="6"
        >
          <v-form
            v-model="valid"
            @submit.prevent="submitForm"
          >
            <v-container>
              <v-row>
                <v-col
                  cols="12"
                  md="6"
                >
                  <v-text-field
                    v-model="firstname"
                    :rules="nameRules"
                    :label="$t('contact-firstname')"
                    required
                  />
                </v-col>
                <v-col
                  cols="12"
                  md="6"
                >
                  <v-text-field
                    v-model="lastname"
                    :rules="nameRules"
                    :label="$t('contact-lastname')"
                    required
                  />
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12">
                  <v-text-field
                    v-model="email"
                    :rules="emailRules"
                    :label="$t('contact-email')"
                    required
                  />
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12">
                  <v-text-field
                    v-model="phone"
                    v-mask="phoneMask"
                    :rules="phoneRules"
                    :label="$t('contact-phone')"
                    required
                  />
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12">
                  <v-textarea
                    v-model="message"
                    :rules="messageRules"
                    :label="$t('contact-message')"
                    required
                  />
                </v-col>
              </v-row>
              <v-row justify="center">
                <v-btn
                  class="w-100"
                  color="primary"
                  type="submit"
                  :disabled="!valid"
                >
                  {{ $t('contact-submit') }}
                </v-btn>
              </v-row>
            </v-container>
          </v-form>
        </v-col>
      </v-row>
    </div>
    <v-dialog
      v-model="showSuccessDialog"
      max-width="400"
    >
      <v-card>
        <v-card-title class="text-h5">
          {{ $t('success-title') }}
        </v-card-title>
        <v-card-text>{{ $t('success-message') }}</v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="primary"
            @click="closeDialog"
          >
            {{ $t('close') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<i18n>
{
  "en": {
    "hero-title": "Contact",
    "contact-title": "Contact Us",
    "contact-description": "Make suggestions, provide feedback, and ask questions. We are always ready to hear from you, fellow citizens who are equally interested in preserving our history.",
    "contact-firstname": "First Name",
    "contact-lastname": "Last Name",
    "contact-email": "Email",
    "contact-phone": "Phone Number",
    "contact-message": "Message",
    "contact-submit": "Submit",
    "name-required": "This field is required.",
    "name-max-length": "Name must be at most 50 characters long.",
    "email-required": "This field is required.",
    "email-valid": "Email must be valid.",
    "phone-required": "This field is required.",
    "phone-valid": "Phone number must be valid.",
    "message-required": "This field is required.",
    "message-min-length": "Message must be at least 10 characters long.",
    "success-title": "Success",
    "success-message": "Your message has been sent successfully!",
    "close": "Close",
    "name-only-letters": "The name must contain only letters and spaces.",
    "message-max-length": "The message must be at most 200 characters long",
    "message-no-special-characters": "The message must not contain special characters"
  },
  "pt-br": {
    "hero-title": "Contato",
    "contact-title": "Fale conosco",
    "contact-description": "Faça sugestões, críticas e tire suas dúvidas com a gente. Estamos sempre dispostos a ouvir você, brasileiro, que com certeza é igualmente interessado na preservação de nossa história, como nós somos.",
    "contact-firstname": "Primeiro nome",
    "contact-lastname": "Último nome",
    "contact-email": "E-mail",
    "contact-phone": "Número de telefone",
    "contact-message": "Mensagem",
    "contact-submit": "Enviar",
    "name-required": "Este campo é obrigatório.",
    "name-max-length": "O nome deve ter no máximo 50 caracteres.",
    "email-required": "Este campo é obrigatório.",
    "email-valid": "E-mail deve ser válido.",
    "phone-required": "Este campo é obrigatório.",
    "phone-valid": "Número de telefone deve ser válido.",
    "message-required": "Este campo é obrigatório.",
    "message-min-length": "Mensagem deve ter no mínimo 10 caracteres.",
    "success-title": "Agradecemos seu contato!",
    "success-message": "Sua mensagem foi enviada com sucesso!",
    "close": "Fechar",
    "name-only-letters": "O nome deve conter apenas letras e espaços.",
    "message-max-length": "A mensagem deve conter no máximo 200 caracteres",
    "message-no-special-characters": "A mensagem não deve conter caracteres especiais."
  }
}
</i18n>

<script>
import { TheMask } from 'vue-the-mask';
import HeroBanner from '@/components/panel/HeroBanner';

export default {
  name: 'Contact',
  components: {
    HeroBanner,
    TheMask,
  },
  layout: 'portal',
  data: () => ({
    valid: false,
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    message: '',
    showSuccessDialog: false,
  }),
  computed: {
    phoneMask() {
      return this.phone.length <= 14 ? '(##) ####-####' : '(##) # ####-####';
    },
    nameRules() {
      return [
        (value) => !!value || this.$t('name-required'),
        (value) => (value && value.length <= 50) || this.$t('name-max-length'),
        (value) => /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/.test(value) || this.$t('name-only-letters'),
      ];
    },
    emailRules() {
      return [
        (value) => !!value || this.$t('email-required'),
        (value) => /.+@.+\..+/.test(value) || this.$t('email-valid'),
      ];
    },
    phoneRules() {
      return [
        (value) => !!value || this.$t('phone-required'),
        (value) => /^\(\d{2}\) \d \d{4}-\d{4}$/.test(value) || /^\(\d{2}\) \d{4}-\d{4}$/.test(value) || this.$t('phone-valid'),
      ];
    },
    messageRules() {
      return [
        (value) => !!value || this.$t('message-required'),
        (value) => (value && value.length >= 10) || this.$t('message-min-length'),
        (value) => (value && value.length <= 200) || this.$t('message-max-length'),
        (value) => /^[A-Za-z0-9\s]*$/.test(value) || this.$t('message-no-special-characters'),
      ];
    },
  },
  methods: {
    async submitForm() {
      if (this.valid) {
        await this.$api.post('/portal/contato/', {
          name: this.firstname,
          surname: this.lastname,
          email: this.email,
          phone: this.phone,
          message: this.message,
        });
        this.showSuccessDialog = true;

        this.firstname = '';
        this.lastname = '';
        this.email = '';
        this.phone = '';
        this.message = '';
      }
    },
    closeDialog() {
      this.showSuccessDialog = false;
      this.$router.push(this.localePath('/'));
    },
  },
};
</script>

<style lang="sass">
h2
  font-size: 24px
  padding-bottom: 2rem

.content
  align-items: flex-start
  max-width: 1100px
  gap: 1rem
</style>
