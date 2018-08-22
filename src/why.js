function why() {
    const randi = (n) => Math.round((n - 1) * Math.random()) + 1;
    let a;
    switch (randi(10)) {
        case 1:
            a = special_case();
            break;
        case 2:
        case 3:
        case 4:
            a = phrase();
            break;
        default:
            a = sentence();
            break;
    }
    a = a[0].toUpperCase() + a.substr(1);
    return a;

    function special_case() {
        let a;
        switch (randi(12)) {
            case 1:
                a = 'why not?';
                break;
            case 2:
                a = 'don\'t ask!';
                break;
            case 3:
                a = 'it\'s your karma.';
                break;
            case 4:
                a = 'stupid question!';
                break;
            case 5:
                a = 'how should I know?';
                break;
            case 6:
                a = 'can you rephrase that?';
                break;
            case 7:
                a = 'it should be obvious.';
                break;
            case 8:
                a = 'the devil made me do it.';
                break;
            case 9:
                a = 'the computer did it.';
                break;
            case 10:
                a = 'the customer is always right.';
                break;
            case 11:
                a = 'in the beginning, God created the heavens and the earth...';
                break;
            case 12:
                a = 'don\'t you have something better to do?';
        }
        return a;
    }

    function phrase() {
        let a;
        switch (randi(3)) {
            case 1:
                a = ['for the ', nouned_verb(), ' ', prepositional_phrase(), '.'].join('');
                break;
            case 2:
                a = ['to ', present_verb(), ' ', object(), '.'].join('');
                break;
            case 3:
                a = ['because ', sentence()].join('');
                break;
        }
        return a;
    }

    function preposition() {
        let a;
        switch (randi(2)) {
            case 1:
                a = 'of';
                break;
            case 2:
                a = 'from';
                break;
        }
        return a;
    }

    function prepositional_phrase() {
        let a;
        switch (randi(3)) {
            case 1:
                a = [preposition(), ' ', article(), ' ', noun_phrase()].join('');
                break;
            case 2:
                a = [preposition(), ' ', proper_noun()].join('');
                break;
            case 3:
                a = [preposition(), ' ', accusative_pronoun()].join('');
                break;
        }
        return a;
    }

    function sentence() {
        return [subject(), ' ', predicate(), '.'].join('');
    }

    function subject() {
        let a;
        switch (randi(4)) {
            case 1:
                a = proper_noun();
                break;
            case 2:
                a = nominative_pronoun();
                break;
            default:
                a = [article(), ' ', noun_phrase()].join('');
                break;
        }
        return a;
    }

    function proper_noun() {
        let a;
        switch (randi(12)) {
            case 1:
                a = 'Cleve';
                break;
            case 2:
                a = 'Jack';
                break;
            case 3:
                a = 'Bill';
                break;
            case 4:
                a = 'Joe';
                break;
            case 5:
                a = 'Pete';
                break;
            case 6:
                a = 'Loren';
                break;
            case 7:
                a = 'Damian';
                break;
            case 8:
                a = 'Barney';
                break;
            case 9:
                a = 'Nausheen';
                break;
            case 10:
                a = 'Mary Ann';
                break;
            case 11:
                a = 'Penny';
                break;
            case 12:
                a = 'Mara';
                break;
        }
        return a;
    }

    function noun_phrase() {
        let a;
        switch (randi(4)) {
            case 1:
                a = noun();
                break;
            case 2:
                a = [adjective_phrase(), ' ', noun_phrase()].join('');
                break;
            default:
                a = [adjective_phrase(), ' ', noun()].join('');
                break;
        }
        return a;
    }

    function noun() {
        let a;
        switch (randi(6)) {
            case 1:
                a = 'mathematician';
                break;
            case 2:
                a = 'programmer';
                break;
            case 3:
                a = 'system manager';
                break;
            case 4:
                a = 'engineer';
                break;
            case 5:
                a = 'hamster';
                break;
            case 6:
                a = 'kid';
                break;
        }
        return a;
    }

    function nominative_pronoun() {
        let a;
        switch (randi(5)) {
            case 1:
                a = 'I';
                break;
            case 2:
                a = 'you';
                break;
            case 3:
                a = 'he';
                break;
            case 4:
                a = 'she';
                break;
            case 5:
                a = 'they';
                break;
        }
        return a;
    }

    function accusative_pronoun() {
        let a;
        switch (randi(4)) {
            case 1:
                a = 'me';
                break;
            case 2:
                a = 'all';
                break;
            case 3:
                a = 'her';
                break;
            case 4:
                a = 'him';
                break;
        }
        return a;
    }

    function nouned_verb() {
        let a;
        switch (randi(2)) {
            case 1:
                a = 'love';
                break;
            case 2:
                a = 'approval';
                break;
        }
        return a;
    }

    function adjective_phrase() {
        let a;
        switch (randi(6)) {
            case 1:
            case 2:
            case 3:
                a = adjective();
                break;
            case 4:
            case 5:
                a = [adjective_phrase(), ' and ', adjective_phrase()].join('');
                break;
            case 6:
                a = [adverb(), ' ', adjective()].join('');
        }
        return a;
    }

    function adverb() {
        let a;
        switch (randi(3)) {
            case 1:
                a = 'very';
                break;
            case 2:
                a = 'not very';
                break;
            case 3:
                a = 'not excessively';
                break;
        }
        return a;
    }

    function adjective() {
        let a;
        switch (randi(7)) {
            case 1:
                a = 'tall';
                break;
            case 2:
                a = 'bald';
                break;
            case 3:
                a = 'young';
                break;
            case 4:
                a = 'smart';
                break;
            case 5:
                a = 'rich';
                break;
            case 6:
                a = 'terrified';
                break;
            case 7:
                a = 'good';
                break;
        }
        return a;
    }

    function article() {
        let a;
        switch (randi(3)) {
            case 1:
                a = 'the';
                break;
            case 2:
                a = 'some';
                break;
            case 3:
                a = 'a';
                break;
        }
        return a;
    }

    function predicate() {
        let a;
        switch (randi(3)) {
            case 1:
                a = [transitive_verb(), ' ', object()].join('');
                break;
            default:
                a = intransitive_verb();
                break;
        }
        return a;
    }

    function present_verb(){
        let a;
        switch(randi(3)){
            case 1:
                a = 'fool';
                break;
            case 2:
                a = 'please';
                break;
            case 3:
                a = 'satisfy';
                break;
        }
        return a;
    }

    function transitive_verb(){
        let a;
        switch(randi(10)){
            case 1:
                a = 'threatened';
                break;
            case 2:
                a = 'told';
                break;
            case 3:
                a = 'asked';
                break;
            case 4:
                a = 'helped';
                break;
            default:
                a = 'obeyed';
                break;
        }
        return a;
    }

    function intransitive_verb(){
        let a;
        switch(randi(6)){
            case 1:
                a = 'insisted on it';
                break;
            case 2:
                a = 'suggested it';
                break;
            case 3:
                a = 'told me to';
                break;
            case 4:
                a = 'wanted it';
                break;
            case 5:
                a = 'knew it was a good idea';
                break;
            case 6:
                a = 'wanted it that way';
                break;
        }
        return a;
    }

    function object(){
        let a;
        switch(randi(10)){
            case 1:
                a = accusative_pronoun();
                break;
            default:
                a = [article(), ' ', noun_phrase()].join('');
                break;
        }
        return a;
    }
}

module.exports = why;
