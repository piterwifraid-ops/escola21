export const getPaymentToken = () => {
	const secret = "sk_tpiM8TWOjQsHKZ6Fnhm2u8JgR9jWs5A8r1Lw4SqhnyfmBZ9o";
	const publicKey = "pk_h8op2k72EbiEhVFvdio8gXd8Kc-IbN_SVXrjJxx4eyAGlor0";

	const token = btoa(unescape(encodeURIComponent(`${secret}:${publicKey}`)));

	return "Basic " + token;
};
