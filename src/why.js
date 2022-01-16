function sample(array) {
    // Return random sample from an array
    return array[Math.floor(Math.random() * array.length)];
}

function weightedSample(data) {
    // Given a dictionary { object : weight } return a weighted random sample
    const totalSum = Object.values(data).reduce((a, b) => a + b, 0);
    const numElements = Object.values(data).length;
    const randNum = Math.random() * totalSum;
    let threshold = 0;
    for (let i = 0; i < numElements; i++) {
        threshold += parseFloat(Object.values(data)[i]);
        if (threshold > randNum) {
            return Object.keys(data)[i];
        }
    }
}

const specialCase = () => sample(
    [
        'why not?',
        'don\'t ask!',
        'it\'s your karma.',
        'stupid question!',
        'how should I know?',
        'can you rephrase that?',
        'it should be obvious.',
        'the devil made me do it.',
        'the computer did it.',
        'the customer is always right.',
        'in the beginning, God created the heavens and the earth...',
        'don\'t you have something better to do?',
    ],
);

const properNoun = () => sample(
    ['Cleve', 'Jack', 'Bill', 'Joe', 'Pete', 'Loren', 'Damian', 'Barney', 'Nausheen', 'Mary Ann', 'Penny', 'Mara'],
);

const noun = () => sample(
    ['mathematician', 'programmer', 'system manager', 'engineer', 'hamster', 'kid'],
);

const nounedVerb = () => sample(['love', 'approval']);

const adjective = () => sample(['tall', 'bald', 'young', 'smart', 'rich', 'terrified', 'good']);

const presentVerb = () => sample(['fool', 'please', 'satisfy']);
const transitiveVerb = () => sample(['threatened', 'told', 'asked', 'helped', 'obeyed']);
const intransitiveVerb = () => sample(['insisted on it', 'suggested it', 'told me to', 'wanted it', 'knew it was a good idea', 'wanted it that way']);

const article = () => sample(['the', 'some', 'a']);
const nominativePronoun = () => sample(['I', 'you', 'he', 'she', 'they']);
const accusativePronoun = () => sample(['me', 'all', 'her', 'him']);

const preposition = () => sample(['of', 'from']);
const adverb = () => sample(['very', 'not very', 'not excessively']);

const phrase = () => sample([
    `for the ${nounedVerb()} ${prepositionalPhrase()}.`,
    `to ${presentVerb()} ${object()}.`,
    `because ${sentence()}`,
]);

let prepositionalPhrase = () => sample([
    `${preposition()} ${article()} ${nounPhrase()}`,
    `${preposition()} ${properNoun()}`,
    `${preposition()} ${accusativePronoun()}`,
]);

let sentence = () => `${subject()} ${predicate()}.`;

let subject = () => weightedSample({
    [properNoun()]: 1,
    [nominativePronoun()]: 1,
    [`${article()} ${nounPhrase()}`]: 2,
});

let object = () => weightedSample({
    [accusativePronoun()]: 1,
    [`${article()} ${nounPhrase()}`]: 9,
});

let predicate = () => weightedSample({
    [`${transitiveVerb()} ${object()}`]: 1,
    [intransitiveVerb()]: 2,
});

/*
Due to the recursion in nounPhrase and adjectivePhrase, if the same pattern as the other functions is used,
 a call stack size exceeded error will occur.
 */
// let nounPhrase = () => weightedSample({
//     [noun()] : 1,
//     // [`${adjectivePhrase()} ${nounPhrase()}`] : 1,
//     [`${adjectivePhrase()} ${noun()}`] : 2
// });

// function adjectivePhrase() {
//     return weightedSample({
//         [adjective()]: 3,
//         // [`${adjectivePhrase()} and ${adjectivePhrase()}`]: 1,
//         [`${adverb()} ${adjective()}`]: 1
//     })
// }

const randi = (n) => Math.round((n - 1) * Math.random()) + 1;
function nounPhrase() {
    let a;
    switch (randi(4)) {
    case 1:
        a = noun();
        break;
    case 2:
        a = [adjectivePhrase(), ' ', nounPhrase()].join('');
        break;
    default:
        a = [adjectivePhrase(), ' ', noun()].join('');
        break;
    }
    return a;
}
function adjectivePhrase() {
    let a;
    switch (randi(6)) {
    case 1:
    case 2:
    case 3:
        a = adjective();
        break;
    case 4:
    case 5:
        a = [adjectivePhrase(), ' and ', adjectivePhrase()].join('');
        break;
    case 6:
        a = [adverb(), ' ', adjective()].join('');
    }
    return a;
}

const why = () => {
    const whyResult = weightedSample({ [specialCase()]: 1, [phrase()]: 3, [sentence()]: 6 });
    return whyResult[0].toUpperCase() + whyResult.substr(1);
};

module.exports = why;
