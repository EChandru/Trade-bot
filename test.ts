import YahooFinance from 'yahoo-finance2';
const yahooFinance = new YahooFinance();
yahooFinance.chart('AAPL', { period1: '2023-01-01' }).then(res => console.log(res.quotes[0])).catch(console.error);
