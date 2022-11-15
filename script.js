// Authentication elements and event listeners

let apiParam = new URLSearchParams(window.location.search).get('api-key')
let apiKey = localStorage.getItem('apiKey') || apiParam
let mainContainerElem = document.getElementById('main-container')
let authenticationElem = document.getElementById('authentication')
let submitApiKeyElem = document.getElementById('submit-api-key')
let apiKeyElem = document.getElementById('api-key')

submitApiKeyElem.addEventListener('click', () => validateApiKey(apiKeyElem.value))

// Authentication functions

async function validateApiKey(apiKey) {
    if (apiKey === null) {
        authenticationElem.style.display = 'flex'
        return
    }
    let url = `https://translation.googleapis.com/language/translate/v2/languages?key=${apiKey}`
    let response = await fetch(url)
    let json = await response.json()
    if (json.error) {
        authenticationElem.style.display = 'flex'
        alert(json.error.message)
        return
    }
    localStorage.setItem('apiKey', apiKey)
    authenticationElem.style.display = 'none'
    mainContainerElem.style.display = ''
}

// Initial validation

validateApiKey(apiKey)

if (apiParam) {
    window.history.replaceState('', '', window.location.href.split('?')[0])
}

// Define elements and add event listeners

let waitingElem = document.getElementById('waiting')
let outputListElem = document.getElementById('output-list')
let submitElem = document.getElementById('submit')
let resultsElem = document.getElementById('results')
let endElem = document.getElementById('end')
let textInputElem = document.getElementById('text-input')
let predefinedElem = document.getElementById('predefined')
let backToTopElem = document.getElementById('back-to-top')
let characterCountElem = document.getElementById('character-count')

submitElem.addEventListener('click', freeTranslator)
predefinedElem.addEventListener('change', setToPredefinedText)
backToTopElem.addEventListener('click', backToTop)
textInputElem.addEventListener('input', updateCharacterCount)


// Define functions

function showOriginalText(e) {
    let elem = e.target
    if (elem.dataset.originalShown === 'true') {
        elem.innerHTML = elem.dataset.english
        elem.dataset.originalShown = 'false'
    } else {
        elem.innerHTML = elem.dataset.original
        elem.dataset.originalShown = 'true'
    }
}

function backToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' })
}

function generateLoadingState(iterations) {
    waitingElem.innerHTML = `<p>⏳ Waiting for translations (about ${Math.round(iterations * .6)} seconds)...`
    submitElem.style.display = 'none'
    outputListElem.innerHTML = ''
    resultsElem.innerHTML = ''
    endElem.style.display = 'none'
}

function setToPredefinedText() {
    textInputElem.value = predefinedElem.value
    updateCharacterCount()
}

function printResults(output) {
    let items = output
    let ol = document.createElement('ol')
    outputListElem.appendChild(ol)

    for (let i = 0; i < items.length; i++) {
        let item = items[i]
        let li = document.createElement('li')
        li.dataset.original = originalLanguageArray[i] + ' <br/><i>(' + originalLanguageNameArray[i] + '</i>)'
        li.dataset.english = item
        ol.appendChild(li)
        li.innerHTML += item
    }

    waitingElem.innerHTML = ''
    submitElem.style.display = ''
    resultsElem.innerHTML = '<h2 id="results-h2">Results</h2><strong>Click on a translation to see the original language text.</strong>'
    endElem.style.display = 'block'
    resultsElem.scrollIntoView({ behavior: 'smooth' })
    let listItems = document.querySelectorAll('li')
    for (let i = 0; i < listItems.length; i++) {
        listItems[i].addEventListener('click', (e) => showOriginalText(e))
    }
}

async function translateText(text, source, target) {
    let encodedText = encodeURIComponent(text)
    let baseUrl = 'https://translation.googleapis.com/language/translate/v2'

    let url = `${baseUrl}?key=${apiKey}&q=${encodedText}&target=${target}&source=${source}`
    let response = await fetch(url)
    let json = await response.json()
    let data = json.data
    let translations = data.translations
    let translationText = translations[0].translatedText
    console.log(translationText)
    return translationText
}

function updateCharacterCount() {
    let input = textInputElem.value
    let characterCountElem = document.getElementById('character-count')
    characterCountElem.innerHTML = 500 - input.length
    characterCountElem.value = input.length
    if (input.length > 450) {
        characterCountElem.style.color = 'red'
    } else {
        characterCountElem.style.color = 'white'
    }

}

// The translation function that passes output to printResults()

updateCharacterCount()

async function freeTranslator() {

    let text = document.getElementById('text-input').value
    let iterations = document.getElementById('iterations-input').value
    let outputArray = []
    let oldLanguage = 'en'
    let oldLanguageIndex = 20 // Index of English in languageArray

    // Bad input handling

    if (iterations > 30 || iterations < 1) {
        outputListElem.innerHTML = '⚠️ SUBMISSION FAILED: Iterations must be between 1 and 30, inclusive.'
        return
    }
    if (text.length > 500) {
        outputListElem.innerHTML = '⚠️ SUBMISSION FAILED: Iterations must be 500 characters or less.'
        return
    }
    if (!text) {
        text = 'I left the text input blank and all I got was this crappy sentence.'
    }

    generateLoadingState(iterations)

    text = text.replace(/<[^>]*>?/gm, '') // Strip HTML from input

    // The array of all languages and their language codes.

    let languageArray = [['af', 'Afrikaans'], ['sq', 'Albanian'], ['am', 'Amharic'], ['ar', 'Arabic'], ['hy', 'Armenian'], ['az', 'Azerbaijani'], ['eu', 'Basque'], ['be', 'Belarusian'], ['bn', 'Bengali'], ['bs', 'Bosnian'], ['bg', 'Bulgarian'], ['ca', 'Catalan'], ['ceb', 'Cebuano'], ['zh-CN', 'Chinese (Simplified)'], ['zh-TW', 'Chinese (Traditional)'], ['co', 'Corsican'], ['hr', 'Croatian'], ['cs', 'Czech'], ['da', 'Danish'], ['nl', 'Dutch'], ['en', 'English'], ['eo', 'Esperanto'], ['et', 'Estonian'], ['fi', 'Finnish'], ['fr', 'French'], ['fy', 'Frisian'], ['gl', 'Galician'], ['ka', 'Georgian'], ['de', 'German'], ['el', 'Greek'], ['gu', 'Gujarati'], ['ht', 'Haitian Creole'], ['ha', 'Hausa'], ['haw', 'Hawaiian'], ['he', 'Hebrew'], ['hi', 'Hindi'], ['hmn', 'Hmong'], ['hu', 'Hungarian'], ['is', 'Icelandic'], ['ig', 'Igbo'], ['id', 'Indonesian'], ['ga', 'Irish'], ['it', 'Italian'], ['ja', 'Japanese'], ['jv', 'Javanese'], ['kn', 'Kannada'], ['kk', 'Kazakh'], ['km', 'Khmer'], ['rw', 'Kinyarwanda'], ['ko', 'Korean'], ['ku', 'Kurdish'], ['ky', 'Kyrgyz'], ['lo', 'Lao'], ['lv', 'Latvian'], ['lt', 'Lithuanian'], ['lb', 'Luxembourgish'], ['mk', 'Macedonian'], ['mg', 'Malagasy'], ['ms', 'Malay'], ['ml', 'Malayalam'], ['mt', 'Maltese'], ['mi', 'Maori'], ['mr', 'Marathi'], ['mn', 'Mongolian'], ['my', 'Myanmar (Burmese)'], ['ne', 'Nepali'], ['no', 'Norwegian'], ['ny', 'Nyanja (Chichewa)'], ['or', 'Odia (Oriya)'], ['ps', 'Pashto'], ['fa', 'Persian'], ['pl', 'Polish'], ['pt', 'Portuguese (Portugal, Brazil)'], ['pa', 'Punjabi'], ['ro', 'Romanian'], ['ru', 'Russian'], ['sm', 'Samoan'], ['gd', 'Scots Gaelic'], ['sr', 'Serbian'], ['st', 'Sesotho'], ['sn', 'Shona'], ['sd', 'Sindhi'], ['si', 'Sinhala (Sinhalese)'], ['sk', 'Slovak'], ['sl', 'Slovenian'], ['so', 'Somali'], ['es', 'Spanish'], ['su', 'Sundanese'], ['sw', 'Swahili'], ['sv', 'Swedish'], ['tl', 'Tagalog (Filipino)'], ['tg', 'Tajik'], ['ta', 'Tamil'], ['tt', 'Tatar'], ['te', 'Telugu'], ['th', 'Thai'], ['tr', 'Turkish'], ['tk', 'Turkmen'], ['uk', 'Ukrainian'], ['ur', 'Urdu'], ['ug', 'Uyghur'], ['uz', 'Uzbek'], ['vi', 'Vietnamese'], ['cy', 'Welsh'], ['xh', 'Xhosa'], ['yi', 'Yiddish'], ['yo', 'Yoruba'], ['zu', 'Zulu']]

    let languageCount = languageArray.length

    // Random number generator to select languages in loop

    function randomNumber() {
        return Math.round(Math.random() * (languageCount - 1))
    }

    outputArray.push(text + '<br/><em>(Original text)</em>') // Add original text to `output_array`

    // The main loop for translations
    originalLanguageArray = [text]
    originalLanguageNameArray = ['English']
    for (let i = 0; i < iterations; i++) {

        let languageIndex = randomNumber()
        newLanguage = languageArray[languageIndex][0]

        if (newLanguage === oldLanguage) { // Throw away any iterations where no translation is needed.
            i--
            continue
        }

        text = await translateText(text, oldLanguage, newLanguage) // Perform translation from old language to new.
        originalLanguageArray.push(text)
        originalLanguageNameArray.push(languageArray[languageIndex][1])

        if (newLanguage === 'en') { // No need to translate output to English if new language is English.

            outputArray.push(text + '<br/><em>(' + languageArray[oldLanguageIndex][1] + ' to ' + languageArray[languageIndex][1] + ')</em>')

        } else { // But otherwise, translate the current iteration to English and add it to `output_array`.

            newText = await translateText(text, newLanguage, 'en')
            outputArray.push(newText + '<br/><em>(' + languageArray[oldLanguageIndex][1] + ' to ' + languageArray[languageIndex][1] + ')</em>')
        }

        // Store used language info for next iteration.

        oldLanguage = newLanguage
        oldLanguageIndex = languageIndex

    }
    printResults(outputArray)
}
