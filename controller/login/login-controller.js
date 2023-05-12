const UserDb = require('../../model/user.js');
const jwt = require('jsonwebtoken');

exports.auth = async (req, res)=>{
    const { username, password } = req.body;
    // Controllo se l'utente esiste nel database
    const user = await UserDb.findOne({ username });
    if (!user) {
        return res.status(401).json({ message: 'Invalid username or password' });
    }
    // Controllo la correttezza della password
    const isValidPassword = (password === user.password);
    if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid username or password' });
    }
    // Generazione del token di autenticazione
    const token = jwt.sign(
        { username: user.username, roles: user.roles },
        'your-secret-key'
    );
    // Invio della risposta con il token
    res.json({ token });
}