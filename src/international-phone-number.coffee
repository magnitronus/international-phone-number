# Author Marek Pietrucha
# https://github.com/mareczek/international-phone-number

"use strict"
angular.module("internationalPhoneNumber", [])

.constant 'ipnConfig', {
    allowExtensions:    false
    autoFormat:         true
    autoHideDialCode:   true
    autoPlaceholder:    true
    customPlaceholder:  null
    defaultCountry:     ""
    geoIpLookup:        null
    nationalMode:       true
    numberType:         "MOBILE"
    onlyCountries:      undefined
    preferredCountries: ['us', 'gb']
    utilsScript:        ""
    autoAddDialCode:    true
  }

.directive 'internationalPhoneNumber', ['$timeout', 'ipnConfig', ($timeout, ipnConfig) ->

  restrict:   'A'
  require: '^ngModel'
  scope:
    ngModel: '='
    onCountrySelect: '&'

  link: (scope, element, attrs, ctrl) ->

    if ctrl
      if element.val() != ''
        $timeout () ->
          element.intlTelInput 'setNumber', element.val()
          ctrl.$setViewValue element.val()
        , 0


    read = () ->
      ctrl.$setViewValue element.intlTelInput("getNumber")

    handleWhatsSupposedToBeAnArray = (value) ->
      if value instanceof Array
        value
      else
        value.toString().replace(/[ ]/g, '').split(',')

    options = angular.copy(ipnConfig)

    angular.forEach options, (value, key) ->
      return unless attrs.hasOwnProperty(key) and angular.isDefined(attrs[key])
      option = attrs[key]
      if key == 'preferredCountries'
        options.preferredCountries = handleWhatsSupposedToBeAnArray option
      else if key == 'onlyCountries'
        options.onlyCountries = handleWhatsSupposedToBeAnArray option
      else if typeof(value) == "boolean"
        options[key] = (option == "true")
      else
        options[key] = option
        
    # Wait for ngModel to be set
    watchOnce = scope.$watch('ngModel', (newValue) ->
      # Wait to see if other scope variables were set at the same time
      scope.$$postDigest ->

        if newValue != null && newValue != undefined && newValue.length > 0

          if newValue[0] != '+'
            newValue = '+' + newValue

          element.val newValue

        element.intlTelInput(options)
        
        scope.select_handler = (object) ->
            value = element.val()
            scope.onCountrySelect({'selected_country': object})
        
        if scope.onCountrySelect
            element.intlTelInput('onCountrySelected', scope.select_handler)

        unless attrs.skipUtilScriptDownload != undefined || options.utilsScript
          element.intlTelInput('loadUtils', '/bower_components/intl-tel-input/lib/libphonenumber/build/utils.js')

        watchOnce()

    )


    ctrl.$formatters.push (value) ->
      if !value
        return value

      element.intlTelInput 'setNumber', value
      element.val()

    ctrl.$parsers.push (value) ->
      if !value
        return value

      value.replace(/[^\d]/g, '')

    ctrl.$validators.internationalPhoneNumber = (value) ->
      selectedCountry = element.intlTelInput('getSelectedCountryData')

      if !value || (selectedCountry && (selectedCountry.dialCode == value || selectedCountry.dialCode == '+'+value))
        return true

      element.intlTelInput("isValidNumber")

    element.on 'blur keyup change', (event) ->
      if ctrl.$viewValue!=element.val()
          scope.$apply read
          return

    element.on '$destroy', () ->
      element.intlTelInput('destroy');
      element.off 'blur keyup change'
]
