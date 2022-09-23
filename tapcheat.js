// Début du code
// Préfix
const p = "Tap'Cheat | "
// Notre fonction permettant d'attendre entre chaque mots
const waitFor = delay => new Promise(resolve => setTimeout(resolve, delay));
// Importer puppeteer, qui va contrôler notre engin chromium
const puppeteer = require('puppeteer');
// Importer la fonction permettant d'utiliser les variables de notre .env
require('dotenv').config()
// Importer FS, pour lire notre ASCII
const fs = require("fs")
// Importer better-console...
const console = require('better-console');
// Importer prompt, qui va nous récupérer le feed de la console...
const prompt = require('prompt');

// Notre script de tout démarrage...
fs.readFile(__dirname+'/tapcheat.txt', 'utf8', function(err, data){
  console.clear()
  console.info(`\n${data}\n`) 
});

// Début de notre code. Async pour un top-level execution
(async () => {
  // Lançons notre navigateur, sans headless pour avoir un retour vidéo
  const browser = await puppeteer.launch({headless: false});
  console.info("__________")
  console.info(`${p}Navigateur Lancé.`)
  // Préparons un nouvel onglet
  const page = await browser.newPage();
  page.setDefaultTimeout("120000")
  // Lançons le lien taptouche sur ce nouvel onglet
  await page.goto(process.env.LOGIN_URL + "/connexion", {
    waitUntil: 'networkidle2',
  });
  
  // *LOGIN*
  // Se connecter à l'aide des identifiants du .env
  console.warn(`${p}Connexion à votre compte en cours...`)
  if(process.env.LOGIN_USER && process.env.LOGIN_PASS){
    page.type('input[id=nomUtilisateur]', process.env.LOGIN_USER, {delay: 2}).then(() => {
      page.type('input[name=motPasse]', process.env.LOGIN_PASS, {delay: 2}).then(() => {
        page.click('button[id=boutonValidation]')
      })
    })
  }

  // Attendre l'element pour savoir si ont est connectés
  await page.waitForSelector('body[data-urlt="/accueil/"]')
  // Une fois connecté, aller sur l'onglet "pratique"
  await page.goto(process.env.LOGIN_URL+'/pratique')
  console.log(`${p}Connecté au compte.`)
  console.warn(`${p}Sélectionnez un exercice pour démarrer le Tap'Cheat. Si aucun exercice n'est lancé dans 2minutes, le programme se terminera...`)

  // Attendre qu'un exercice se lance
  await page.waitForSelector('span[class="word1 mot"]')
  
  console.info(`${p}Exercice détecté... Lancement dans 5s`, `Tap'Cheat | Merci de ne pas toucher au clavier...`)
  await waitFor(5000);

  // Notre boucle qui v'a s'executer, et taper les mots en boucle jusqu'à la fin.
  var i = 0;
  var stop = false;
  while(!stop) {
    try {
      let e = await page.$(`span[id=scribe-caractere-${i}]`)
      let v = await e.evaluate(el => el.innerHTML)
      if(v == ""){
        await page.keyboard.press("Enter")
      } else if(v == "&nbsp;"){
        await page.keyboard.press("Space")
      } else {
        await page.keyboard.type(v)
      }
      await waitFor(1);
      i++
    } catch (error) {
      if(error.message.includes("TypeError: Cannot read properties of null (reading 'textContent')") || error.message.includes("TypeError: Cannot read properties of null (reading 'innerHTML')") || error.message.includes("Cannot read properties of null (reading 'evaluate')")){
        stop = true;
      console.warn(`${p}Exercice terminé.`)
      process.exit(0)

      } else console.error(error.message)
    }
  }
})();
