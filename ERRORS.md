# Fehler-Dokumentation - Event Booking App

Diese Datei dokumentiert alle Fehler, die während der Entwicklung aufgetreten sind, damit du daraus lernen kannst.

---

## ERROR #1: MongoDB SSL/TLS Internal Error

### Fehler:
```
SSL: CERTIFICATE_VERIFY_FAILED
```

### Ursache:
- Deine aktuelle IP-Adresse war nicht in der MongoDB Atlas Network Access List eingetragen

### Lösung:
1. Gehe zu MongoDB Atlas Dashboard
2. Navigiere zu "Network Access"
3. Füge deine IP-Adresse hinzu (oder verwende 0.0.0.0/0 für alle IPs)
4. Entferne redundante `tls: true` Parameter aus mongoose.connect()

### Lernpunkt:
Stelle sicher, dass Datenbank-Verbindungen korrekt konfiguriert sind, bevor du dich damit auseinandersetzt.

---

## ERROR #2: Module Not Found

### Fehler:
```
Cannot find module '../models/event'
```

### Ursache:
- Die Datei heißt `events.js` (Plural), nicht `event.js`
- Der Import-Pfad war falsch

### Fehlerhafter Code:
```javascript
const Event = require('../models/event');  // ❌ Falsch
```

### Korrekter Code:
```javascript
const Event = require('../models/events');  // ✅ Richtig
```

### Lernpunkt:
- Überprüfe immer die genauen Dateinamen
- Verwende `ls models/` um zu sehen, welche Dateien existieren

---

## ERROR #3: Login Returns null

### Fehler:
```
Query login returns null statt User mit Token
```

### Ursache:
- Ein alter Node-Prozess lief noch auf Port 4000 und servierte alten Code
- Der neue Code mit JWT-Token wurde nicht ausgeführt

### Lösung:
```bash
# Alte Prozesse killen
pkill -f "nodemon index.js"
pkill -f "node index.js"

# Server neu starten
npm start
```

### Lernpunkt:
Stelle sicher, dass nur EINE Instanz des Servers läuft. Prüfe mit:
```bash
lsof -nP -iTCP:4000 -sTCP:LISTEN
```

---

## ERROR #4: EADDRINUSE (Port Already in Use)

### Fehler:
```
Error: listen EADDRINUSE :::4000
```

### Ursache:
- Mehrere Server-Instanzen laufen gleichzeitig
- Ein alter Prozess hat Port 4000 noch nicht freigegeben

### Lösung:
```bash
# Port-Prozess finden
lsof -nP -iTCP:4000 -sTCP:LISTEN

# Prozess killen (z.B. PID 12345)
kill -9 12345

# Oder alle Node-Prozesse killen
pkill -f "node"
pkill -f "nodemon"
```

### Lernpunkt:
Nutze `lsof` um zu sehen, welcher Prozess einen Port blockiert. Das ist wichtig für Debugging!

---

## ERROR #5: createEvent - creator: null

### Fehler:
```
Event erstellt, aber creator ist null
```

### Ursache:
- `.populate('creator')` wurde nicht aufgerufen
- `await` fehlte bei der Populate-Operation

### Fehlerhafter Code:
```javascript
const event = await Event.create({ ...args, creator: context.user._id });
return event;  // ❌ creator ist nicht gefüllt
```

### Korrekter Code:
```javascript
const event = await Event.create({ ...args, creator: context.user._id });
await event.populate('creator');  // ✅ Jetzt populated
return event.toObject();
```

### Lernpunkt:
- Mongoose `.populate()` muss IMMER verwendet werden, um Referenzen zu füllen
- Vergiss nicht `await` vor `.populate()`

---

## ERROR #6: Query events - creator: null for Old Events

### Fehler:
```
GraphQL Error: Cannot return null for non-nullable field Event.creator!
```

### Ursache:
- Schema definierte `creator: User!` (nicht null)
- Alte Events in der Datenbank haben null als creator
- GraphQL konnte null-Wert nicht zurückgeben

### Lösung - Schema ändern:
```javascript
// Vorher:
creator: User!  // ❌ Nicht nullable

// Nachher:
creator: User   // ✅ Nullable für Rückwärtskompatibilität
```

### Lernpunkt:
Denke an Datenbankmigrationen! Wenn du Schema änderst, könnte alte Daten nicht kompatibel sein.

---

## ERROR #7: deleteEvent - Cast to ObjectId Failed

### Fehler:
```
Cast to ObjectId failed for value "" at path "_id"
```

### Ursache:
- Empty String `""` wurde als eventId übergeben
- Mongoose konnte `""` nicht zu ObjectId konvertieren

### Fehlerhafter Code:
```javascript
await Event.findByIdAndDelete(args.eventId);  // ❌ eventId könnte ""sein
```

### Korrekter Code:
```javascript
if (!args.eventId || args.eventId.trim() === '') {
  throw new UserInputError('Event ID is required');
}
await Event.findByIdAndDelete(args.eventId);  // ✅ Validiert
```

### Lernpunkt:
Validiere IMMER die Input-Argumente bevor du sie mit der Datenbank verwendest!

---

## ERROR #8: deleteEvent - Missing Variable

### Fehler:
```
Variable $eventId is required but not provided
```

### Ursache:
- Client sendete eine Mutation ohne $eventId Variable

### Beispiel Mutation:
```graphql
mutation DeleteEvent {
  deleteEvent(eventId: "123")  # ❌ Variable $eventId wurde nicht definiert
}
```

### Korrekter Mutation:
```graphql
mutation DeleteEvent($eventId: ID!) {
  deleteEvent(eventId: $eventId)  # ✅ Variable definiert
}
```

### Lernpunkt:
Verwende Variables in GraphQL Mutations! Das ist Beste Praxis.

---

## ERROR #9: Exit Code 143 During Server Restart

### Fehler:
```
npm start
Exit Code: 143
```

### Ursache:
Exit Code 143 ist NICHT ein Fehler! Es bedeutet das SIGTERM Signal (process termination).
Das ist normal, wenn du `pkill` benutzt um einen Prozess zu stoppen.

### Was passiert:
```bash
pkill -f "node index.js"    # Sendet SIGTERM (Signal 15)
                             # Process beendet sich mit Code 143
```

### Normale Restart-Sequenz:
```bash
# Alte Prozesse killen (code 143 = normal)
pkill -f "nodemon index.js"; pkill -f "node index.js"; sleep 1

# Server starten (sollte jetzt erfolgreich sein)
npm start
```

### Lernpunkt:
Exit Code 143 ist KEIN Fehler - es zeigt nur, dass der Prozess durch SIGTERM beendet wurde.
Das ist völlig normal und erwartet!

---

## ERROR #10: Frontend React Installation

### Fehler:
```
Frontend Ordner war leer nach create-react-app
```

### Ursache:
- `create-react-app .` im leeren Ordner funktioniert manchmal nicht
- npm-Zugriff oder Permissions-Probleme

### Lösung:
```bash
# Manuell installieren statt create-react-app zu verwenden
cd frontend
npm init -y
npm install react react-dom react-scripts web-vitals

# Dann public/ und src/ Ordner mit Dateien erstellen
```

### Lernpunkt:
Wenn `create-react-app` fehlschlägt, kann man React manuell installieren!

---

## ERROR #11: JWT Context Extraction - Missing await

### Fehler:
```
Error: Cannot read property 'id' of undefined
```

### Ursache:
- `User.findById()` ist asynchron aber wurde nicht mit `await` aufgerufen
- Code versuchte auf `user` zuzugreifen bevor die Promise erfüllt war

### Fehlerhafter Code:
```javascript
const user = User.findById(decodedToken.id);  // ❌ Keine await
return { currentUser: user };
```

### Korrekter Code:
```javascript
const user = await User.findById(decodedToken.id);  // ✅ Mit await
return { currentUser: user };
```

### Lernpunkt:
IMMER `await` vor MongoDB-Operationen verwenden (findById, findOne, create, etc.)!

---

## ERROR #12: bookEvent - Duplicate Check Broken

### Fehler:
```
TypeError: array.find is not a function
```

### Ursache:
```javascript
const bookings = await Booking.find(...);  // Das ist ein Array
const duplicate = bookings.find(...);       // Das sollte funktionieren

// Aber wenn Code anders war:
const duplicate = booking.find(...);  // ❌ 'booking' ist ein Object, nicht Array!
```

### Korrekter Code:
```javascript
const existingBooking = await Booking.findOne({
  event: args.eventId,
  user: context.user._id,
});

if (existingBooking) {
  throw new UserInputError('Already booked');
}
```

### Lernpunkt:
- `.find()` mit Query-Objekt gibt EIN Dokument zurück (oder null)
- `.find()` ohne Query gibt Array zurück
- Mongoose Methoden gut lernen!

---

## Häufige Fehlerquellen

### 1. Async/Await vergessen
```javascript
// ❌ Falsch
const data = await Event.find();  // Vergessen auf Promise zu warten
console.log(data);

// ✅ Richtig
const data = await Event.find();
console.log(data);
```

### 2. .populate() vergessen
```javascript
// ❌ Falsch
const events = await Event.find();
// events[0].creator ist noch Object ID, nicht User Objekt

// ✅ Richtig
const events = await Event.find().populate('creator');
// Jetzt ist events[0].creator ein echtes User-Objekt
```

### 3. Mehrere Server-Instanzen
```bash
# ❌ Falsch
npm start &  # Start im Hintergrund
npm run dev  # Starte noch eine Instanz!
# Jetzt laufen 2 Server und kämpfen um Port 4000

# ✅ Richtig
npm start  # Nur EINE Instanz!
```

### 4. Schema vs. Database Mismatch
```javascript
// Wenn du Schema änderst aber alte Daten sind noch da:
// creator: User!  (alt) vs creator: User  (neu)
// = GraphQL Error für alte Documents

// Lösung: Migrationen schreiben oder Schema kompatibel machen!
```

---

## ERROR #13: React - Identifier 'React' has already been declared

### Fehler:
```
SyntaxError: Identifier 'React' has already been declared. (9:7)
```

### Ursache:
- `React` wurde zweimal importiert: einmal oben und dann nochmal unten in der gleichen Datei
- Passiert z.B. wenn man einen Import einfügt, ohne den alten zu löschen

### Fehlerhafter Code:
```javascript
import React from 'react';               // ❌ Zeile 1
import './App.css';
// ... andere Imports ...

import React, { useState } from 'react'; // ❌ Zeile 9 - doppelt!
```

### Korrekter Code:
```javascript
import React from 'react';  // ✅ Nur einmal importieren!
import './App.css';
```

### Lernpunkt:
Immer sicherstellen, dass jedes Paket nur EINMAL importiert wird. Bei VSCode: `Ctrl+F` → nach `import React` suchen und doppelte Zeilen entfernen.

---

## ERROR #14: ReferenceError - Navbar is not defined

### Fehler:
```
ReferenceError: Navbar is not defined
```

### Ursache:
- Eine Komponente (`<Navbar/>`) wurde in JSX verwendet, aber nicht importiert
- Die Datei existiert, aber der `import`-Befehl fehlt oben in der Datei

### Fehlerhafter Code:
```javascript
// App.js - kein Navbar-Import!
function App() {
  return (
    <BrowserRouter>
      <Navbar/>  {/* ❌ Woher soll React wissen, was Navbar ist? */}
    </BrowserRouter>
  );
}
```

### Korrekter Code:
```javascript
import Navbar from './components/Navbar';  // ✅ Import hinzufügen

function App() {
  return (
    <BrowserRouter>
      <Navbar/>  {/* ✅ Jetzt bekannt */}
    </BrowserRouter>
  );
}
```

### Lernpunkt:
Jede React-Komponente muss zuerst importiert werden, bevor sie genutzt werden kann. Wenn du `ReferenceError: X is not defined` siehst, fehlt meistens der `import`-Befehl.

---

## ERROR #15: Bootstrap Collapse funktioniert nicht

### Fehler:
- Hamburger-Button in der Navbar wird geklickt, aber das Menü öffnet sich nicht

### Ursachen (zwei Probleme gleichzeitig!):
1. **Bootstrap JavaScript nicht importiert** – Nur CSS war importiert, das JS für Collapse fehlte
2. **ID-Mismatch** – Button sucht `#navbarNav` aber div hat `id="navbarContent"`

### Fehlerhafter Code:
```javascript
// index.js - kein Bootstrap JS:
import 'bootstrap/dist/css/bootstrap.min.css';
// ❌ bootstrap JS fehlt!

// Navbar.js - ID stimmt nicht überein:
<button data-bs-target="#navbarNav">...</button>          // zeigt auf "navbarNav"
<div className="collapse" id="navbarContent">...</div>    // ❌ heißt "navbarContent"
```

### Korrekter Code:
```javascript
// index.js - Bootstrap JS hinzufügen:
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';  // ✅

// Navbar.js - IDs müssen übereinstimmen:
<button data-bs-target="#navbarNav">...</button>    // zeigt auf "navbarNav"
<div className="collapse" id="navbarNav">...</div>  // ✅ gleiche ID!
```

### Lernpunkt:
- Bootstrap Collapse benötigt **JavaScript** – CSS allein reicht nicht!
- `data-bs-target` und `id` müssen **exakt übereinstimmen** (Tippfehler sind häufig)
- `bootstrap.bundle.min.js` enthält sowohl Bootstrap JS als auch Popper.js

---

## Debugging-Tipps

### 1. Logs nutzen
```javascript
console.log('Wert:', value);  // Einfaches Debugging
console.error('Fehler:', error);  // Für Fehler
```

### 2. Ports überprüfen
```bash
lsof -nP -iTCP:4000 -sTCP:LISTEN
```

### 3. Prozesse überprüfen
```bash
ps -ef | grep node
ps -ef | grep nodemon
```

### 4. MongoDB Verbindung testen
```javascript
mongoose.connection.on('connected', () => console.log('DB connected'));
mongoose.connection.on('error', (err) => console.error('DB error:', err));
```

### 5. GraphQL Playground nutzen
Gehe zu `http://localhost:4000/graphql` und teste Queries direkt!

---

## Checkpoint: Validierungsfragen

Teste dein Wissen:

1. **Was ist Exit Code 143?**
   - [ ] Ein echter Fehler
   - [x] SIGTERM Signal beim Prozess-Ende (normal!)

2. **Wann brauchst du `.populate()`?**
   - [x] Wenn du Referenzen zu anderen Collections ausfüllen willst
   - [ ] Bei jedem MongoDB Query

3. **Was bedeutet EADDRINUSE?**
   - [x] Ein Prozess blockiert bereits den Port
   - [ ] Authentifizierungsfehler

4. **Wie viele Server sollten gleichzeitig laufen?**
   - [ ] 2 (npm start + npm run dev)
   - [x] 1 (entweder npm start ODER npm run dev)

---

---

## ERROR #16: CSS-Styles wirken nicht (margin zu klein)

### Fehler:
- CSS-Klasse `.main-content` ist gesetzt, aber der Abstand ist kaum sichtbar

### Ursache:
- `margin: .7rem .2rem` → `.2rem` seitlich = nur ~3px → kaum sichtbar!
- Sehr kleine `rem`-Werte unter `0.5rem` sind oft unsichtbar

### Fehlerhafter Code:
```css
.main-content {
    margin: .7rem .2rem;  /* ❌ .2rem seitlich = ~3px, unsichtbar! */
}
```

### Korrekter Code:
```css
.main-content {
    margin: 1rem 2rem;  /* ✅ 1rem oben/unten, 2rem links/rechts */
}
```

### Lernpunkt:
- `1rem` = 16px (Standardgröße)
- `.2rem` = ~3px (zu klein um sichtbar zu sein!)
- Typische nützliche Werte: `0.5rem`, `1rem`, `1.5rem`, `2rem`
- Nutze Browser DevTools (F12 → Elements) um CSS live zu testen

---

## Lernfrage: Unterschied zwischen function und Arrow Function

### Frage:
Was ist der Unterschied zwischen:

```javascript
export default function SignUpPage() {
  // ...
}
```

und:

```javascript
const SignUpPage = () => {
  // ...
};

export default SignUpPage;
```

### Antwort (kurz):
- Beide funktionieren als React-Komponente.
- `function` ist hoisted (kann im Code früher verwendet werden).
- `const` + Arrow ist nicht hoisted (erst ab Definitionszeile nutzbar).
- Arrow Function hat kein eigenes `this`, normale `function` schon.

### Lernpunkt:
Für React sind beide Varianten korrekt. Wähle im Projekt einen Stil und bleibe konsistent.

---

## ERROR #17: Neuer User wird nach SignUp nicht im LocalStorage gespeichert

### Fehler:
- Nach erfolgreicher Registrierung bleibt im LocalStorage der alte `username`/`userId`
- Neuer User erscheint nicht wie erwartet

### Ursache:
- In der SignUp-Seite wurde auf das falsche Datenfeld geprüft (`data.login` statt `data.createUser`)
- Dadurch wurde `value.login(...)` nicht ausgeführt und LocalStorage blieb unverändert
- Zusätzlich können auf `http://localhost:3000` auch Keys von anderen Projekten liegen (z. B. `photoapp_*`), was verwirrend wirkt

### Fehlerhafter Code:
```javascript
useEffect(() => {
  if (!loading && data?.login) { // ❌ falsch für SignUp
    const token = data.createUser.token;
    const userId = data.createUser.userId;
    const username = data.createUser.username;
    value.login(token, userId, username);
  }
}, [data, loading]);
```

### Korrekter Code (robuster):
```javascript
const [createUser] = useMutation(CREATE_USER, {
  onCompleted: ({ createUser: createdUser }) => {
    if (createdUser?.userId) {
      value.login(createdUser.token, createdUser.userId, createdUser.username);
      navigate('/events');
    }
  }
});
```

### Lernpunkt:
- Bei GraphQL immer exakt das Feld auswerten, das die Mutation wirklich liefert (`createUser` vs `login`)
- Für Auth-Writebacks ist `onCompleted` oft stabiler als nachträgliche Ableitung über `useEffect`
- In DevTools nur die app-relevanten Keys prüfen: `token`, `userId`, `username`

---

## ERROR #18: Cannot read properties of null (reading 'useState')

### Fehler:
```
TypeError: Cannot read properties of null (reading 'useState')
```

### Ursache:
Dieser Fehler tritt auf, wenn React intern `null` ist — das passiert meistens in einem dieser Fälle:

1. **Hook wird außerhalb einer React-Komponente aufgerufen** — z.B. `useState` direkt auf oberster Ebene einer Funktion, die keine Komponente ist
2. **Zwei React-Instanzen gleichzeitig** — z.B. die App importiert React aus zwei verschiedenen Paketen (oft in Monorepos oder bei falschen Symlinks)
3. **Komponente wird als normale Funktion aufgerufen** statt als JSX gerendert

### Fehlerhafter Code:
```javascript
// ❌ Falsch: useState außerhalb einer Komponente
function EventList() {
  const [selectedEvent, setSelectedEvent] = useState(null); // ← hier kein Problem...
}

// Aber wenn EventList() direkt aufgerufen wird statt <EventList />:
const result = EventList(); // ❌ React kennt keinen Kontext → null
```

```javascript
// ❌ Falsch: Hook in einer verschachtelten Funktion die kein Hook-Regelwerk befolgt
export default function EventsPage() {
  function EventList() {
    const [x, setX] = useState(null); // ❌ Verschachtelte Komponente mit eigenem useState
  }                                    // kann manchmal instabil sein
}
```

### Korrekter Code:
```javascript
// ✅ Richtig: Komponente auf oberster Ebene definieren
function EventList() {
  const [selectedEvent, setSelectedEvent] = useState(null); // ✅
  // ...
}

export default function EventsPage() {
  return <EventList />; // ✅ als JSX rendern, nicht als Funktion aufrufen
}
```

### Lernpunkt:
- Hooks (`useState`, `useEffect`, etc.) dürfen **nur in React-Funktionskomponenten** oder **Custom Hooks** aufgerufen werden
- Reaktionskomponenten müssen immer als `<Komponente />` gerendert werden, **nie** als `Komponente()` aufgerufen werden
- Die [Rules of Hooks](https://react.dev/warnings/invalid-hook-call-warning) sind streng: kein bedingter Aufruf, kein Aufruf in normalen Funktionen

---

## ERROR #19: Modal Crash - Cannot read properties of null (reading 'useState')

### Fehler:
```
TypeError: Cannot read properties of null (reading 'useState')
at Modal (...bundle.js...)
```

### Ursache:
- Der Crash kam aus `react-bootstrap` (`Modal`), nicht aus `Event.js`
- Projekt lief mit React 19, aber die verwendete `react-bootstrap`-Version war nicht kompatibel
- Deshalb ist der Fehler im Stacktrace bei `Modal` aufgetreten (`at Modal ...`)

### Beobachtung:
- `Event.js` war korrekt
- Fehler erschien erst beim Oeffnen des Modals
- Nach Ersetzen von `react-bootstrap`-`Modal` durch reines Bootstrap-Markup war der Fehler weg

### Fehlerhafter Code:
```javascript
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
```

### Korrekter Code (stabil):
```javascript
// Kein react-bootstrap Modal verwenden
// Stattdessen Bootstrap 5 Klassen direkt in JSX:
// modal, modal-dialog, modal-content, modal-header, modal-body, modal-footer
```

### Lernpunkt:
- Wenn ein Fehler direkt in einem Third-Party-Component-Stacktrace auftaucht (`at Modal`), zuerst Kompatibilitaet der Pakete pruefen
- Bei React 19 auf UI-Library-Kompatibilitaet achten
- Fallback-Strategie: natives Bootstrap-Markup verwenden, wenn Wrapper-Library Probleme macht

---

## ERROR #20: Event.js - Identifier 'loading' has already been declared

### Fehler:
```text
SyntaxError: Identifier 'loading' has already been declared. (38:28)
```

### Ursache:
Es gab mehrere Probleme gleichzeitig in derselben Komponente:

1. `loading`, `error`, `data` wurden schon aus `useQuery(EVENTS)` deklariert.
2. Danach wurden bei `useMutation(BOOK_EVENT)` erneut `loading`, `error`, `data` verwendet.
3. `useMutation` stand unter fruehen `return`-Zeilen (`if (loading) return ...`), was gegen die Rules of Hooks verstoesst.
4. Im Optionsobjekt von `useMutation` stand ein ungueltiges `if (error) { ... }` statt `onError`.
5. In `confirmText` wurde versehentlich die Mutation direkt ausgefuehrt.

### Fehlerhafter Code:
```javascript
const { loading, error, data } = useQuery(EVENTS);

if (loading) return <p>Loading...</p>;
if (error) return <p>{error.message}</p>;

const [bookEventHandler, { loading, error, data }] = useMutation(BOOK_EVENT, {
  onCompleted: () => {
    setSelectedEvent(null);
  },
  if (error) {
    console.error(error.message);
  }
});

<SimpleModal confirmText={bookEventHandler({ variables: { eventId: selectedEvent._id } })} />
```

### Korrekter Code:
```javascript
const { loading, error, data } = useQuery(EVENTS);

const [bookEvent, { loading: bookingLoading }] = useMutation(BOOK_EVENT, {
  onCompleted: () => {
    setSelectedEvent(null);
  },
  onError: (err) => {
    console.error(err.message);
    setSelectedEvent(null);
  }
});

if (loading) return <p>Loading...</p>;
if (error) return <p>{error.message}</p>;

const confirmHandler = () => {
  if (!value.token) {
    setSelectedEvent(null);
    navigate('/login');
    return;
  }
  bookEvent({ variables: { eventId: selectedEvent._id } });
};

<SimpleModal
  onConfirm={confirmHandler}
  confirmText={isEventOwner ? 'انت صاحب هذه المناسبة' : value.token ? 'احجز' : 'سجل دخول للحجز'}
  isDisabled={isEventOwner || bookingLoading}
/>
```

### Lernpunkt:
- In einer Funktion darf ein Variablenname nur einmal deklariert werden.
- Bei mehreren Hooks mit gleichen Feldnamen immer aliasen, z.B. `loading: bookingLoading`.
- Hooks muessen immer vor fruehen Returns und in stabiler Reihenfolge stehen.
- Fehlerbehandlung bei Apollo-Mutationen in `onError` machen, nicht mit `if` im Optionsobjekt.
- UI-Props wie `confirmText` duerfen keine Mutation direkt ausfuehren.

---

## ERROR #21: onCompleted vs onError Handler Vertauscht

### Fehler:
```
Console-Error: "قد تم حجز هذا الحدث بالفعل" (schon gebucht)
aber die Success-Nachricht wird stattdessen angezeigt
```

UI zeigt Error-Messages nicht an, obwohl Apollo sie liefert.

### Ursache:
Die Success- und Error-Handler in der `useMutation` waren vertauscht:

1. **`onCompleted`** zeigte die Error-Message statt Success-Message
2. **`onError`** zeigte die Success-Message statt Error-Message
3. Zusätzlich: `error.message` aus `useQuery` wurde in `onCompleted` verwendet (falsch!)

### Fehlerhafter Code:
```javascript
const [bookEvent, { loading: bookingLoading }] = useMutation(BOOK_EVENT, {
  onCompleted: () => {
    setSelectedEvent(null);
    setAlert(error.message);  // ❌ FALSCH! zeigt Query-Error statt Success
  },
  onError: (err) => { 
    console.error(err.message);
    setSelectedEvent(null);
    setAlert('تم حجز المناسبة بنجاح');  // ❌ FALSCH! Success beim Error-Handler
  },
});
```

### Korrekter Code:
```javascript
const [bookEvent, { loading: bookingLoading }] = useMutation(BOOK_EVENT, {
  onCompleted: () => {
    setSelectedEvent(null);
    setAlert('تم حجز المناسبة بنجاح ✓');  // ✅ Success-Message
    setTimeout(() => setAlert(''), 3000);  // Auto-Hide nach 3 Sekunden
  },
  onError: (err) => { 
    console.error(err.message);
    setSelectedEvent(null);
    setAlert(err.message);  // ✅ Echo der Apollo-Error-Message
    setTimeout(() => setAlert(''), 5000);  // Auto-Hide nach 5 Sekunden
  },
});
```

### Warum war das Problem unsichtbar?
- Fehlermeldung "قد تم حجز هذا الحدث بالفعل" kam aus Apollo (onError)
- Aber `onError` zeigte eine falsche Nachricht (Success-Text)
- User sah die echte Error-Message nur in Browser DevTools Console

### Lernpunkt:
- `onCompleted`: wird ausgelöst wenn Mutation erfolgreich ist
- `onError`: wird ausgelöst wenn GraphQL/Network-Fehler auftritt
- Verwende IMMER `err.message` vom Parameter, nicht von anderen Quellen
- Nutze `setTimeout` um Nachrichten automatisch zu beschließen (UX besser)
- Unterschiedliche Timeout-Dauer für Success (kurz) vs Error (länger) ist üblich

---

## ERROR #22: A React Element from an older version of React was rendered

### Fehler:
```
Uncaught runtime errors:
A React Element from an older version of React was rendered.
This is not supported.
```

### Ursache:
- `reactstrap` wurde installiert (npm install reactstrap)
- `reactstrap` bringt eine alte React-Version mit bundled
- Projekt läuft mit React 19, aber reactstrap-Komponenten sind aus einer älteren React-Version
- Das erzeugt einen Konflikt: zwei verschiedene React-Versionen versuchen gleichzeitig zu laufen

Diese Fehler ist dem ERROR #19 (react-bootstrap Problem) sehr ähnlich:
- Alte UI-Library (reactstrap) mit React 19 nicht kompatibel
- Lösung: entweder Library aktualisieren oder durch natives HTML ersetzen

### Betroffener Code:
```javascript
// Error.js
import { Alert } from 'reactstrap'  // ❌ Alt, nicht kompatibel mit React 19

const Error = props => {
    return props.error ? <Alert>{props.error}</Alert> : ''   
}
```

### Korrekter Code:
```javascript
// Error.js - Stattdessen Bootstrap 5 CSS-Klassen verwenden
import React from 'react'

const Error = props => {
    if (!props.error) return null;
    return (
        <div className="alert alert-danger" role="alert" style={{ margin: '1rem 0' }}>
            {props.error}
        </div>
    );
}

export default Error
```

### Lösung durchgeführt:
1. `reactstrap` entfernt: `npm uninstall reactstrap`
2. Error-Komponente umgeschrieben: Bootstrap 5 HTML-Klassen statt Component
3. Build erfolgreich: `Compiled successfully`

### Lernpunkt:
- Vorsicht mit UI-Libraries: Nicht alle sind mit React 19 kompatibel
- Bei Fehler "older version of React": 
  - Entweder Library upgraden
  - Oder durch native HTML/CSS ersetzen (oft stabiler)
- Bootstrap 5 ist direkt über CSS-Klassen nutzbar, braucht keine JS-Library
- Muster: `alert alert-danger`, `modal`, `btn btn-primary` etc. funktionieren ohne Component-Wrappers

---

## ERROR #23: Uncaught Runtime Overlay bei Login/Signup (CombinedGraphQLErrors)

### Fehler:
```text
Uncaught runtime errors:
CombinedGraphQLErrors: البريد الإلكتروني غير موجود. يرجى تسجيل حساب جديد.
```

### Ursache:
- In `Login.js` und `SignUp.js` wurde die Mutation mit `await` aufgerufen.
- Wenn Apollo einen GraphQL-Fehler liefert, wirft `await login(...)` bzw. `await createUser(...)` eine Exception.
- Obwohl `onError` gesetzt war, blieb der Promise-Reject ohne `try/catch` und React zeigte den roten Runtime-Overlay.

### Fehlerhafter Code:
```javascript
await login({
  variables: { email: email.trim(), password: password.trim() }
});
```

### Korrekter Code:
```javascript
try {
  await login({
    variables: { email: email.trim(), password: password.trim() }
  });
} catch (_) {
  // onError setzt bereits die UI-Meldung
}
```

### Lösung durchgeführt:
1. In beiden Seiten `try/catch` um den Mutation-Aufruf ergänzt.
2. Fehlermeldung robust ausgelesen: `graphQLErrors[0].message` oder Fallback.
3. Doppelte Ausgabe entfernt (`{error && <p>...`), damit nur die Alert-Box rendert.

### Lernpunkt:
- `onError` ersetzt nicht automatisch ein `try/catch`, wenn du `await` benutzt.
- Bei Apollo-Mutations immer beide Ebenen bedenken:
  1. UI-Handling in `onError`
  2. Promise-Reject mit `try/catch` verhindern

---

## ERROR #24: Alert-Farbe falsch durch Text-Heuristik

### Fehler:
- Manche Nachrichten wurden gruen angezeigt, obwohl es eigentliche Fehler waren.
- Andere wurden rot, obwohl sie eher Info/Success waren.

### Ursache:
- Die Alert-Farbe wurde aus dem Nachrichtentext abgeleitet (`includes('بنجاح')` oder `includes('✓')`).
- Diese Heuristik ist unzuverlaessig, weil Backend-Messages variieren.

### Fehlerhafter Code:
```javascript
const isSuccess = props.error.includes('بنجاح') || props.error.includes('✓');
const alertClass = isSuccess ? 'alert alert-success' : 'alert alert-danger';
```

### Korrekter Code:
```javascript
const Error = ({ error, type = 'danger' }) => {
  const alertClass = type === 'success' ? 'alert alert-success' : 'alert alert-danger';
  // ...
};
```

### Lösung durchgeführt:
1. `Error`-Komponente auf explizites `type`-Prop umgestellt.
2. Seiten setzen nun bewusst `type='danger'` oder `type='success'`.

### Lernpunkt:
- UI-Status (success/error/info) nie aus Textinhalt erraten.
- Status immer als eigenes Feld/Prop transportieren.

---

## ERROR #25: Eigene Events koennen nicht gebucht werden (Owner-Guard)

### Fehler:
- Nutzer klickt auf Event und erwartet "احجز", sieht aber "انت صاحب هذه المناسبة".
- Keine Buchung moeglich fuer eigene Events.

### Ursache:
- Das ist ein beabsichtigtes Verhalten in der UI-Logik.
- Wenn `creator` des Events mit `userId` des eingeloggten Users uebereinstimmt, gilt `isEventOwner = true`.
- Dann wird der Buchungsbutton im Modal deaktiviert.

### Beobachtung:
- Wenn alle sichtbaren Events vom selben Account erstellt wurden, kann der Nutzer keines davon buchen.

### Loesung/Workaround:
1. Mit einem zweiten Account einloggen.
2. Event eines anderen Users oeffnen.
3. Dann erscheint im Modal "احجز" und die Buchung funktioniert.

### Lernpunkt:
- Event-Ersteller soll sein eigenes Event nicht buchen koennen.
- Fuer Tests immer zwei Accounts nutzen (Owner + Teilnehmer).

---

## ERROR #26: Ungueltiger Token trotz scheinbar eingeloggt

### Fehler:
```text
Beim Klick auf "احجز": "يجب تسجيل الدخول"
```

### Ursache:
- Im Browser war noch ein alter/ungueltiger Token in `localStorage`.
- UI zeigte weiterhin eingeloggt, aber Backend hat den Token als ungueltig abgelehnt.

### Symptome:
- Header zeigt Username + Logout.
- Geschuetzte Mutations/Queries schlagen trotzdem mit `UNAUTHENTICATED` fehl.

### Schnelle Loesung:
1. Auf "تسجيل الخروج" klicken.
2. Neu einloggen.

### Falls es weiter passiert:
1. Browser-Konsole oeffnen.
2. `localStorage.clear()` ausfuehren.
3. Seite neu laden.
4. Neu einloggen.

### Lernpunkt:
- UI-Auth-Zustand und gueltiger Backend-Token koennen auseinanderlaufen.
- Bei Auth-Problemen immer Token in `localStorage` pruefen und ggf. erneuern.

---

**Viel Erfolg beim Lernen! 🚀**

---

## ERROR #27: graphql-ws Import-Pfad veraltet nach Upgrade auf v6

### Fehler:
```text
Package subpath './lib/use/ws' is not defined by "exports" in graphql-ws/package.json
```

### Ursache:
- `graphql-ws` wurde auf Version 6 aktualisiert.
- In v6 wurde der interne Pfad `graphql-ws/lib/use/ws` entfernt.
- Der alte Import funktioniert nicht mehr.

### Fehlerhafter Code (index.js):
```js
const { useServer } = require('graphql-ws/lib/use/ws'); // FALSCH in v6
```

### Loesung:
```js
const { useServer } = require('graphql-ws/use/ws'); // RICHTIG fuer v6
```

### Lernpunkt:
- Nach einem Paket-Upgrade immer Changelog/README pruefen.
- `node -e "require('graphql-ws/use/ws')"` testen um gueltigen Pfad zu finden.

---

## ERROR #28: pubsub.asyncIterator is not a function (graphql-subscriptions v3)

### Fehler:
```json
{
  "message": "pubsub.asyncIterator is not a function",
  "path": ["eventAdded"]
}
```

### Ursache:
- `graphql-subscriptions` wurde auf Version 3 aktualisiert.
- In v3 wurde `asyncIterator()` umbenannt zu `asyncIterableIterator()`.
- Die alte Methode existiert nicht mehr.

### Fehlerhafter Code (resolvers/event.js):
```js
Subscription: {
    eventAdded: {
        subscribe: () => pubsub.asyncIterator(['EVENT_ADDED']) // FALSCH in v3
    }
}
```

### Loesung:
```js
Subscription: {
    eventAdded: {
        subscribe: () => pubsub.asyncIterableIterator(['EVENT_ADDED']) // RICHTIG fuer v3
    }
}
```

### Lernpunkt:
- Major-Version-Updates (v2 → v3) enthalten oft Breaking Changes.
- Bei `asyncIterator is not a function` → immer Version von `graphql-subscriptions` pruefen.
- Loesung: `asyncIterator` → `asyncIterableIterator`.

---

## ERROR #29: Module not found - Can't resolve '@appolo/client'

### Fehler:
```text
Module not found: Error: Can't resolve '@appolo/client' in frontend/src/Pages
```

### Ursache:
- Tippfehler im Paketnamen in `frontend/src/Pages/fragments.js`.
- Import wurde mit `@appolo/client` geschrieben (falsch), korrekt ist `@apollo/client`.

### Fehlerhafter Code:
```js
import { gql } from '@appolo/client'; // FALSCH
```

### Loesung:
```js
import { gql } from '@apollo/client'; // RICHTIG
```

### Lernpunkt:
- Bei `Module not found` zuerst Import-Strings auf Tippfehler pruefen.
- Paketname exakt aus `package.json` uebernehmen.

---

## ERROR #30: Runtime - Cannot access 'EVENTS' before initialization + No fragment named EventFields

### Fehler:
```text
ReferenceError: Cannot access 'EVENTS' before initialization
Invariant Violation: No fragment named EventFields
```

### Ursache:
- Das Fragment wurde in der `EVENTS`-Query an einer falschen Stelle eingebettet.
- `${EVENT_FIELDS}` stand innerhalb der Feldauswahl von `events { ... }` statt oben im Document.
- Dadurch konnte Apollo das Fragment nicht korrekt registrieren und die Query geriet in einen fehlerhaften Zustand.

### Fehlerhafter Code (`frontend/src/Pages/queries.js`):
```js
export const EVENTS = gql`
  query Events {
    events {
      ${EVENT_FIELDS} // FALSCH: nicht innerhalb der Selection einbetten
      ...EventFields
    }
  }
`;
```

### Loesung:
```js
export const EVENTS = gql`
  ${EVENT_FIELDS}
  query Events {
    events {
      ...EventFields
      creator {
        _id
        username
      }
    }
  }
`;
```

### Lernpunkt:
- Fragment-Definitionen gehoeren auf Dokument-Ebene (oben in `gql`), nicht in ein Feld.
- In der Feldauswahl nur `...FragmentName` verwenden.
- Wenn Apollo `No fragment named ...` meldet, zuerst die Position von `${FRAGMENT}` in der Query pruefen.
