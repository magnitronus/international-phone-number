(function() {
  "use strict";
  angular.module("internationalPhoneNumber", []).constant('ipnConfig', {
    allowExtensions: false,
    autoFormat: true,
    autoHideDialCode: true,
    autoPlaceholder: true,
    customPlaceholder: null,
    defaultCountry: "",
    geoIpLookup: null,
    nationalMode: true,
    numberType: "MOBILE",
    onlyCountries: void 0,
    preferredCountries: ['us', 'gb'],
    utilsScript: "",
    autoAddDialCode: true
  }).directive('internationalPhoneNumber', [
    '$timeout', 'ipnConfig', function($timeout, ipnConfig) {
      return {
        restrict: 'A',
        require: '^ngModel',
        scope: {
          ngModel: '=',
          onCountrySelect: '&'
        },
        link: function(scope, element, attrs, ctrl) {
          var handleWhatsSupposedToBeAnArray, options, read, watchOnce;
          if (ctrl) {
            if (element.val() !== '') {
              $timeout(function() {
                element.intlTelInput('setNumber', element.val());
                return ctrl.$setViewValue(element.val());
              }, 0);
            }
          }
          read = function() {
            return ctrl.$setViewValue(element.val());
          };
          handleWhatsSupposedToBeAnArray = function(value) {
            if (value instanceof Array) {
              return value;
            } else {
              return value.toString().replace(/[ ]/g, '').split(',');
            }
          };
          options = angular.copy(ipnConfig);
          angular.forEach(options, function(value, key) {
            var option;
            if (!(attrs.hasOwnProperty(key) && angular.isDefined(attrs[key]))) {
              return;
            }
            option = attrs[key];
            if (key === 'preferredCountries') {
              return options.preferredCountries = handleWhatsSupposedToBeAnArray(option);
            } else if (key === 'onlyCountries') {
              return options.onlyCountries = handleWhatsSupposedToBeAnArray(option);
            } else if (typeof value === "boolean") {
              return options[key] = option === "true";
            } else {
              return options[key] = option;
            }
          });
          watchOnce = scope.$watch('ngModel', function(newValue) {
            return scope.$$postDigest(function() {
              if (newValue !== null && newValue !== void 0 && newValue.length > 0) {
                if (newValue[0] !== '+') {
                  newValue = '+' + newValue;
                }
                element.val(newValue);
              }
              element.intlTelInput(options);
              scope.select_handler = function(object) {
                var value;
                value = element.val();
                scope.onCountrySelect({
                  'selected_country': object
                });
                if (scope.dialCode === object.dialCode) {
                  return;
                }
                if (!value) {
                  element.val('+' + object.dialCode);
                } else if (scope.dialCode) {
                  if (value.slice(0, 1) === '+' && value.slice(1, scope.dialCode.length + 1) === scope.dialCode) {
                    element.val('+' + object.dialCode + value.slice(scope.dialCode.length + 1, value.length));
                  } else if (value.slice(0, scope.dialCode.length) === scope.dialCode) {
                    element.val('+' + object.dialCode + value.slice(scope.dialCode.length, value.length - 1));
                  }
                } else if (value.slice(0, object.dialCode.length) !== object.dialCode || value.slice(0, object.dialCode.length + 1) !== '+' + object.dialCode) {
                  element.val('+' + object.dialCode + value);
                }
                scope.dialCode = object.dialCode;
              };
              scope.select_handler(element.intlTelInput('getSelectedCountryData'));
              if (scope.onCountrySelect) {
                element.intlTelInput('onCountrySelected', scope.select_handler);
              }
              if (!(attrs.skipUtilScriptDownload !== void 0 || options.utilsScript)) {
                element.intlTelInput('loadUtils', '/bower_components/intl-tel-input/lib/libphonenumber/build/utils.js');
              }
              return watchOnce();
            });
          });
          ctrl.$formatters.push(function(value) {
            if (!value) {
              return value;
            }
            element.intlTelInput('setNumber', value);
            return element.val();
          });
          ctrl.$parsers.push(function(value) {
            if (!value) {
              return value;
            }
            return value.replace(/[^\d]/g, '');
          });
          ctrl.$validators.internationalPhoneNumber = function(value) {
            var selectedCountry;
            selectedCountry = element.intlTelInput('getSelectedCountryData');
            if (!value || (selectedCountry && (selectedCountry.dialCode === value || selectedCountry.dialCode === '+' + value))) {
              return true;
            }
            return element.intlTelInput("isValidNumber");
          };
          element.on('blur keyup change', function(event) {
            if (ctrl.$viewValue !== element.val()) {
              scope.$apply(read);
            }
          });
          return element.on('$destroy', function() {
            element.intlTelInput('destroy');
            return element.off('blur keyup change');
          });
        }
      };
    }
  ]);

}).call(this);
