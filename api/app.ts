import app from '.';

const port = process.env.PORT ?? 3000;
app.listen(port, () => console.log('Server started'));
