const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser'); // Aggiungi body-parser

const app = express();
const port = 3000;

// Middleware per analizzare i dati del form
app.use(bodyParser.urlencoded({ extended: true }));

// Serve i file statici dalla cartella 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Connessione a MongoDB
mongoose.connect('mongodb+srv://davideebossolo:ce3rKHjSClBxdx7u@cluster1.dgwrk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1/baselorenzodb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connesso al server MongoDB');
  creaCollezioni(); // Richiama la funzione per creare le collezioni
}).catch(err => {
  console.error('Errore durante la connessione a MongoDB:', err);
});

// Schema per la collezione 'consulenze'
const consulenzaSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  message: { type: String }
});

// Modello Mongoose per la collezione 'consulenze'
const Consulenza = mongoose.model('Consulenza', consulenzaSchema);

// Funzione per creare collezioni da file
async function creaCollezioni() {
  try {
    const filePath = path.join(__dirname, 'public', 'nomiCollectionMongoDB.txt');
    const fileContent = fs.readFileSync(filePath, { encoding: 'utf-8' });
    const collezioni = fileContent.split('\n').map(line => line.trim()).filter(line => line);
    
    const db = mongoose.connection.db;

    for (const collectionName of collezioni) {
      // Verifica se la collezione esiste già per evitare errori
      const collectionExists = await db.listCollections({ name: collectionName }).toArray();
      if (collectionExists.length === 0) {
        await db.createCollection(collectionName);
        console.log(`Collezione ${collectionName} creata!`);
      } else {
        console.log(`Collezione ${collectionName} già esistente.`);
      }
    }
  } catch (error) {
    console.error('Errore durante la creazione delle collezioni:', error);
  }
}

// Route per la homepage
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route per gestire il form e salvare i dati in 'consulenze'
app.post('/prenota-consulenza', async (req, res) => {
  try {
    const { 'booking-form-name': name, 'booking-form-phone': phone, 'booking-form-date': date, 'booking-form-time': time, 'booking-form-message': message } = req.body;

    // Crea un nuovo documento nella collezione 'consulenze'
    const nuovaConsulenza = new Consulenza({
      name,
      phone,
      date,
      time,
      message
    });

    // Salva il documento nel database
    await nuovaConsulenza.save();

    // Reindirizza l'utente a una pagina di successo
    res.redirect('/success.html');
  } catch (error) {
    console.error('Errore durante la prenotazione della consulenza:', error);
    res.status(500).send('Errore durante la prenotazione.');
  }
});

// Avvia il server
app.listen(port, () => {
  console.log(`Server avviato su http://localhost:${port}`);
});
