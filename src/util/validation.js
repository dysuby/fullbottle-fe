import { email, minLength, maxLength, sameAs } from 'vuelidate/lib/validators';

const errorMsg = {
  required: field => `${field} is required`,
  email: field => `${field} must be a valid email`,
  maxLength: (field, param) => `${field} length should less than ${param}`,
  minLength: (field, param) => `${field} length should more than ${param}`,
  sameAs: (field, param) => `${field} should be same as ${param}`,
  noSlash: field => `${field} cannot contain / or \\`,
};

const paramsMap = {
  maxLength: 'max',
  minLength: 'min',
  sameAs: 'eq',
};

/**
 * return error message function
 * @param {string} name
 * @param {Object} validations
 */
export function MapErrors(name, validations) {
  return function() {
    const errors = [];
    const field = this.$v[name];

    if (!field.$dirty) return errors;

    for (const key in validations) {
      if (
        Object.prototype.hasOwnProperty.call(field, key) &&
        field[key] === false
      ) {
        let param = null;
        if (key in paramsMap) {
          param = field.$params[key][paramsMap[key]];
        }

        errors.push(errorMsg[key](name, param));
      }
    }

    return errors;
  };
}

export const Validations = {
  email: {
    email,
  },

  username: {
    maxLength: maxLength(24),
    minLength: minLength(4),
  },

  password: {
    maxLength: maxLength(18),
    minLength: minLength(6),
  },

  confirmPassword: {
    sameAs: sameAs('password'),
  },

  entryName: {
    maxLength: maxLength(100),
    noSlash: value => value.indexOf('/') === -1 && value.indexOf('\\') === -1,
  },
};
