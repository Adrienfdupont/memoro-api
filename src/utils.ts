export default function generateToken(name: String){
    const date = new Date(Date.now());
    const payload: Object = {
        name: name,
        date: new Date(Date.now()).toISOString()
    }
    console.log(payload);
}

module.exports = generateToken;