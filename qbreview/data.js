// Original, short recognition drills. Tournament tossups are fetched separately
// from QB Reader, with their original set attribution.
const literature = [
  [
    "tolstoy",
    "Leo Tolstoy",
    "Russian",
    "Tolstoy|Tolstoi",
    [
      [
        "Anna Karenina",
        "An aristocrat leaves Alexei Karenin for Count Vronsky; a parallel plot follows the landowner Konstantin Levin.",
      ],
      [
        "War and Peace",
        "The lives of Pierre Bezukhov, Andrei Bolkonsky, and Natasha Rostova intersect during the Napoleonic Wars.",
      ],
    ],
  ],
  [
    "dostoevsky",
    "Fyodor Dostoevsky",
    "Russian",
    "Dostoevsky|Dostoyevsky",
    [
      [
        "Crime and Punishment",
        "The former student Raskolnikov murders a pawnbroker and is pursued by the investigator Porfiry Petrovich.",
      ],
      [
        "The Brothers Karamazov",
        "Dmitri, Ivan, and Alyosha are the sons of Fyodor Pavlovich; one brother tells the story of the Grand Inquisitor.",
      ],
    ],
  ],
  [
    "chekhov",
    "Anton Chekhov",
    "Russian",
    "Chekhov",
    [
      [
        "The Cherry Orchard",
        "Lyubov Ranevskaya returns to an estate that the merchant Lopakhin proposes turning into summer cottages.",
      ],
      [
        "The Seagull",
        "Konstantin Treplev stages an experimental play; Nina dreams of becoming an actress, and Trigorin is a successful writer.",
      ],
    ],
  ],
  [
    "gogol",
    "Nikolai Gogol",
    "Russian",
    "Gogol",
    [
      [
        "Dead Souls",
        "Chichikov travels between landowners buying the legal ownership of serfs who have already died.",
      ],
      [
        "The Overcoat",
        "The copying clerk Akaky Akakievich saves for a new garment, loses it, and returns as a ghost.",
      ],
    ],
  ],
  [
    "pushkin",
    "Alexander Pushkin",
    "Russian",
    "Pushkin",
    [
      [
        "Eugene Onegin",
        "Tatyana writes a love letter to a fashionable young man who later kills his friend Lensky in a duel.",
      ],
      [
        "The Queen of Spades",
        "Hermann becomes obsessed with a countess’s supposed secret of three winning cards.",
      ],
    ],
  ],
  [
    "turgenev",
    "Ivan Turgenev",
    "Russian",
    "Turgenev",
    [
      [
        "Fathers and Sons",
        "The nihilist medical student Bazarov visits the Kirsanov family and clashes with Pavel Petrovich.",
      ],
      [
        "A Sportsman’s Sketches",
        "This collection of rural sketches depicts Russian peasants and landowners through the encounters of a hunting narrator.",
      ],
    ],
  ],
  [
    "bulgakov",
    "Mikhail Bulgakov",
    "Russian",
    "Bulgakov",
    [
      [
        "The Master and Margarita",
        "Woland and his entourage, including the cat Behemoth, visit Moscow; another narrative follows Pontius Pilate.",
      ],
      [
        "Heart of a Dog",
        "Professor Preobrazhensky transplants human organs into the stray dog Sharik, who becomes the disruptive Sharikov.",
      ],
    ],
  ],
  [
    "nabokov",
    "Vladimir Nabokov",
    "Russian",
    "Nabokov",
    [
      [
        "Pale Fire",
        "A 999-line poem by John Shade is accompanied by Charles Kinbote’s increasingly eccentric commentary about Zembla.",
      ],
      [
        "Lolita",
        "Humbert Humbert narrates his obsession with Dolores Haze and their travels across the United States.",
      ],
    ],
  ],
  [
    "pasternak",
    "Boris Pasternak",
    "Russian",
    "Pasternak",
    [
      [
        "Doctor Zhivago",
        "The physician and poet Yuri is caught in the Russian Revolution and loves Lara Antipova.",
      ],
      [
        "My Sister, Life",
        "This poetry collection takes its title from an address to life as the speaker’s sister and was written in the revolutionary summer of 1917.",
      ],
    ],
  ],
  [
    "akhmatova",
    "Anna Akhmatova",
    "Russian",
    "Akhmatova",
    [
      [
        "Requiem",
        "This cycle of poems bears witness to Stalinist terror and to women waiting outside prison walls for news of loved ones.",
      ],
      [
        "Poem Without a Hero",
        "This long poem returns to the artistic world of St. Petersburg in 1913 and invokes masked figures from its past.",
      ],
    ],
  ],
  [
    "shakespeare",
    "William Shakespeare",
    "British",
    "Shakespeare",
    [
      [
        "King Lear",
        "A king divides his realm according to declarations of love, disowns Cordelia, and wanders on a stormy heath.",
      ],
      [
        "The Tempest",
        "Prospero rules an island with Miranda, commands the spirit Ariel, and conjures a shipwreck.",
      ],
    ],
  ],
  [
    "austen",
    "Jane Austen",
    "British",
    "Austen",
    [
      [
        "Pride and Prejudice",
        "Elizabeth Bennet revises her judgment of Mr. Darcy after hearing his account of Wickham and his role in Lydia’s marriage.",
      ],
      [
        "Emma",
        "A self-confident matchmaker in Highbury interferes in Harriet Smith’s romantic life and eventually marries Mr. Knightley.",
      ],
    ],
  ],
  [
    "dickens",
    "Charles Dickens",
    "British",
    "Dickens",
    [
      [
        "Bleak House",
        "The lawsuit Jarndyce and Jarndyce consumes an inheritance; Esther Summerson narrates part of the novel.",
      ],
      [
        "Great Expectations",
        "Pip believes Miss Havisham is his secret benefactor, but his fortune comes from the convict Magwitch.",
      ],
    ],
  ],
  [
    "woolf",
    "Virginia Woolf",
    "British",
    "Woolf",
    [
      [
        "To the Lighthouse",
        "The Ramsay family’s planned excursion is delayed; Lily Briscoe eventually finishes her painting.",
      ],
      [
        "Mrs Dalloway",
        "Clarissa prepares for a party in London while the shell-shocked veteran Septimus Warren Smith struggles elsewhere in the city.",
      ],
    ],
  ],
  [
    "hardy",
    "Thomas Hardy",
    "British",
    "Hardy",
    [
      [
        "Tess of the d’Urbervilles",
        "Tess Durbeyfield suffers at the hands of Alec d’Urberville and is rejected by her husband Angel Clare.",
      ],
      [
        "The Mayor of Casterbridge",
        "Michael Henchard sells his wife and daughter at a fair, later becoming a prosperous mayor and the rival of Donald Farfrae.",
      ],
    ],
  ],
  [
    "eliot-george",
    "George Eliot",
    "British",
    "George Eliot|Mary Ann Evans|Mary Anne Evans",
    [
      [
        "Middlemarch",
        "Dorothea Brooke marries the scholar Casaubon, who is writing a Key to All Mythologies; Lydgate attempts medical reform.",
      ],
      [
        "The Mill on the Floss",
        "Maggie and Tom Tulliver grow up at Dorlcote Mill; the novel ends with a catastrophic flood.",
      ],
    ],
  ],
  [
    "bronte",
    "Emily Brontë",
    "British",
    "Emily Brontë|Emily Bronte",
    [
      [
        "Wuthering Heights",
        "Lockwood hears Nelly Dean’s account of Heathcliff, Catherine Earnshaw, and two families on the Yorkshire moors.",
      ],
    ],
  ],
  [
    "milton",
    "John Milton",
    "British",
    "Milton",
    [
      [
        "Paradise Lost",
        "Satan rallies the fallen angels in Pandemonium before traveling to Eden to tempt Adam and Eve.",
      ],
      [
        "Samson Agonistes",
        "A blind captive in Gaza is visited by his father Manoa, his former wife Dalila, and the warrior Harapha.",
      ],
    ],
  ],
  [
    "morrison",
    "Toni Morrison",
    "American",
    "Morrison",
    [
      [
        "Beloved",
        "Sethe’s home at 124 Bluestone Road is haunted by the legacy of the daughter she killed rather than return her to slavery.",
      ],
      [
        "Song of Solomon",
        "Milkman Dead travels south to discover his family history; his aunt Pilate carries her name in an earring.",
      ],
    ],
  ],
  [
    "faulkner",
    "William Faulkner",
    "American",
    "Faulkner",
    [
      [
        "The Sound and the Fury",
        "The decline of the Compson family is presented through sections associated with Benjy, Quentin, Jason, and Dilsey.",
      ],
      [
        "As I Lay Dying",
        "The Bundren family transports Addie’s body to Jefferson; one short chapter declares “My mother is a fish.”",
      ],
    ],
  ],
  [
    "melville",
    "Herman Melville",
    "American",
    "Melville",
    [
      [
        "Moby-Dick",
        "Ishmael sails on the Pequod under Captain Ahab, who pursues the white whale that took his leg.",
      ],
      [
        "Billy Budd",
        "A sailor strikes and kills the master-at-arms Claggart after a false accusation; Captain Vere oversees his trial.",
      ],
    ],
  ],
  [
    "fitzgerald",
    "F. Scott Fitzgerald",
    "American",
    "Fitzgerald",
    [
      [
        "The Great Gatsby",
        "Nick Carraway narrates Jay Gatsby’s pursuit of Daisy Buchanan across the divide between West Egg and East Egg.",
      ],
      [
        "Tender Is the Night",
        "The psychiatrist Dick Diver and his wife Nicole encounter the actress Rosemary Hoyt on the French Riviera.",
      ],
    ],
  ],
  [
    "hemingway",
    "Ernest Hemingway",
    "American",
    "Hemingway",
    [
      [
        "The Sun Also Rises",
        "Jake Barnes, Lady Brett Ashley, and their companions travel from Paris to the bullfights in Pamplona.",
      ],
      [
        "For Whom the Bell Tolls",
        "Robert Jordan joins a band of guerrillas in the Spanish Civil War with orders to blow up a bridge.",
      ],
    ],
  ],
  [
    "steinbeck",
    "John Steinbeck",
    "American",
    "Steinbeck",
    [
      [
        "The Grapes of Wrath",
        "The Joad family leaves Oklahoma for California during the Dust Bowl; the former preacher Jim Casy travels with them.",
      ],
      [
        "East of Eden",
        "The Trask and Hamilton families inhabit the Salinas Valley; the brothers Cal and Aron echo the story of Cain and Abel.",
      ],
    ],
  ],
  [
    "dickinson",
    "Emily Dickinson",
    "American",
    "Dickinson",
    [
      [
        "“Because I could not stop for Death”",
        "The speaker rides in a carriage with Death and Immortality, passing a school, fields of grain, and the setting sun.",
      ],
      [
        "“I heard a Fly buzz—when I died—”",
        "A mundane insect interrupts the solemn stillness surrounding a deathbed and the speaker’s failing sight.",
      ],
    ],
  ],
  [
    "whitman",
    "Walt Whitman",
    "American",
    "Whitman",
    [
      [
        "“Song of Myself”",
        "This poem opens with self-celebration and declares that its speaker is large and contains multitudes.",
      ],
      [
        "“When Lilacs Last in the Dooryard Bloom’d”",
        "This elegy for Abraham Lincoln unites the lilac, a western star, and a hermit thrush.",
      ],
    ],
  ],
  [
    "baldwin",
    "James Baldwin",
    "American",
    "Baldwin",
    [
      [
        "Go Tell It on the Mountain",
        "John Grimes grows up in Harlem under the authority of his religious stepfather Gabriel.",
      ],
      [
        "Giovanni’s Room",
        "The American narrator David recalls his relationship with an Italian bartender in Paris.",
      ],
    ],
  ],
  [
    "ellison",
    "Ralph Ellison",
    "American",
    "Ellison",
    [
      [
        "Invisible Man",
        "An unnamed narrator recounts a battle royal, his expulsion from college, and his involvement with the Brotherhood in Harlem.",
      ],
    ],
  ],
  [
    "flaubert",
    "Gustave Flaubert",
    "French",
    "Flaubert",
    [
      [
        "Madame Bovary",
        "Emma marries a provincial doctor, pursues affairs with Rodolphe and Léon, and accumulates debts to Lheureux.",
      ],
      [
        "Sentimental Education",
        "Frédéric Moreau falls in love with Madame Arnoux against the backdrop of nineteenth-century French political upheaval.",
      ],
    ],
  ],
  [
    "hugo",
    "Victor Hugo",
    "French",
    "Hugo",
    [
      [
        "Les Misérables",
        "Jean Valjean is pursued by Inspector Javert, cares for Cosette, and encounters revolutionaries at a Paris barricade.",
      ],
      [
        "The Hunchback of Notre-Dame",
        "The bell-ringer Quasimodo, the priest Claude Frollo, and the dancer Esmeralda are caught in a tragedy centered on a Paris cathedral.",
      ],
    ],
  ],
  [
    "proust",
    "Marcel Proust",
    "French",
    "Proust",
    [
      [
        "In Search of Lost Time",
        "The taste of a madeleine dipped in tea releases the narrator’s memories of Combray; other figures include Swann and Albertine.",
      ],
    ],
  ],
  [
    "camus",
    "Albert Camus",
    "French",
    "Camus",
    [
      [
        "The Stranger",
        "Meursault attends his mother’s funeral and later kills an Arab man on an Algerian beach.",
      ],
      [
        "The Plague",
        "Dr. Bernard Rieux confronts an epidemic in the Algerian city of Oran alongside Tarrou and Rambert.",
      ],
    ],
  ],
  [
    "baudelaire",
    "Charles Baudelaire",
    "French",
    "Baudelaire",
    [
      [
        "The Flowers of Evil",
        "This poetry collection includes “The Albatross,” “Correspondences,” and poems exploring spleen and the ideal.",
      ],
    ],
  ],
  [
    "goethe",
    "Johann Wolfgang von Goethe",
    "German",
    "Goethe",
    [
      [
        "Faust",
        "A dissatisfied scholar makes a pact with Mephistopheles and pursues Gretchen.",
      ],
      [
        "The Sorrows of Young Werther",
        "A young man writes letters about his unrequited love for Charlotte, who is engaged to Albert.",
      ],
    ],
  ],
  [
    "kafka",
    "Franz Kafka",
    "German-language",
    "Kafka",
    [
      [
        "The Metamorphosis",
        "The traveling salesman Gregor Samsa wakes transformed into a monstrous vermin and becomes a burden to his family.",
      ],
      [
        "The Trial",
        "Josef K. is arrested without being told his crime and becomes entangled in an inaccessible judicial system.",
      ],
    ],
  ],
  [
    "mann",
    "Thomas Mann",
    "German",
    "Thomas Mann",
    [
      [
        "The Magic Mountain",
        "Hans Castorp visits his cousin at a Swiss sanatorium and stays for years, debating with Settembrini and Naphta.",
      ],
      [
        "Death in Venice",
        "The writer Gustav von Aschenbach becomes fascinated by the Polish boy Tadzio while disease spreads through an Italian city.",
      ],
    ],
  ],
  [
    "joyce",
    "James Joyce",
    "Irish",
    "Joyce",
    [
      [
        "Ulysses",
        "Leopold Bloom and Stephen Dedalus move through Dublin on 16 June 1904, in a novel that ends with Molly Bloom’s monologue.",
      ],
      [
        "“The Dead”",
        "At a holiday party Gabriel Conroy learns that his wife Gretta remembers a young man named Michael Furey.",
      ],
    ],
  ],
  [
    "yeats",
    "W. B. Yeats",
    "Irish",
    "Yeats",
    [
      [
        "“The Second Coming”",
        "A widening gyre, a falcon unable to hear its falconer, and a rough beast slouching toward Bethlehem figure in this poem.",
      ],
      [
        "“Sailing to Byzantium”",
        "An aging speaker seeks escape from the world of generation and imagines becoming a golden bird.",
      ],
    ],
  ],
  [
    "beckett",
    "Samuel Beckett",
    "Irish",
    "Beckett",
    [
      [
        "Waiting for Godot",
        "Vladimir and Estragon wait beside a tree and encounter Pozzo and Lucky.",
      ],
      [
        "Endgame",
        "Hamm, who cannot stand, and Clov, who cannot sit, share a bleak room with Nagg and Nell in dustbins.",
      ],
    ],
  ],
  [
    "cervantes",
    "Miguel de Cervantes",
    "Spanish",
    "Cervantes",
    [
      [
        "Don Quixote",
        "Alonso Quixano becomes a knight-errant, rides Rocinante, and mistakes windmills for giants while traveling with Sancho Panza.",
      ],
    ],
  ],
  [
    "lorca",
    "Federico García Lorca",
    "Spanish",
    "Lorca",
    [
      [
        "Blood Wedding",
        "A bride runs away with Leonardo on her wedding day, leading to a deadly confrontation.",
      ],
      [
        "The House of Bernarda Alba",
        "A domineering widow imposes eight years of mourning on five daughters, whose desires center on Pepe el Romano.",
      ],
    ],
  ],
  [
    "marquez",
    "Gabriel García Márquez",
    "Colombian",
    "García Márquez|Garcia Marquez|Márquez|Marquez",
    [
      [
        "One Hundred Years of Solitude",
        "Generations of the Buendía family inhabit Macondo; Colonel Aureliano makes little gold fishes.",
      ],
      [
        "Love in the Time of Cholera",
        "Florentino Ariza waits decades to renew his love for Fermina Daza after her marriage to Dr. Juvenal Urbino.",
      ],
    ],
  ],
  [
    "borges",
    "Jorge Luis Borges",
    "Argentine",
    "Borges",
    [
      [
        "“The Garden of Forking Paths”",
        "The spy Yu Tsun discovers that his ancestor Ts’ui Pên imagined a labyrinth of branching times.",
      ],
      [
        "“The Library of Babel”",
        "An apparently endless collection of hexagonal galleries contains books with every possible combination of a fixed alphabet.",
      ],
    ],
  ],
  [
    "neruda",
    "Pablo Neruda",
    "Chilean",
    "Neruda",
    [
      [
        "Twenty Love Poems and a Song of Despair",
        "This poetry collection contains a twentieth poem whose speaker says he can write the saddest lines tonight.",
      ],
      [
        "Canto General",
        "This epic poetry collection surveys the history, geography, and peoples of the Americas and includes “The Heights of Macchu Picchu.”",
      ],
    ],
  ],
  [
    "pessoa",
    "Fernando Pessoa",
    "Portuguese",
    "Pessoa",
    [
      [
        "The Book of Disquiet",
        "This fragmentary prose work is associated with the semi-heteronym Bernardo Soares, a Lisbon bookkeeper.",
      ],
    ],
  ],
  [
    "dante",
    "Dante Alighieri",
    "Italian",
    "Dante|Alighieri",
    [
      [
        "Divine Comedy",
        "A pilgrim lost in a dark wood is guided by Virgil through Hell and Purgatory, and by Beatrice through Heaven.",
      ],
    ],
  ],
  [
    "calvino",
    "Italo Calvino",
    "Italian",
    "Calvino",
    [
      [
        "Invisible Cities",
        "Marco Polo describes fantastic cities to the emperor Kublai Khan.",
      ],
      [
        "If on a winter’s night a traveler",
        "A reader repeatedly begins new novels but encounters interruptions, misbindings, and incomplete narratives.",
      ],
    ],
  ],
  [
    "ibsen",
    "Henrik Ibsen",
    "Norwegian",
    "Ibsen",
    [
      [
        "A Doll’s House",
        "Nora Helmer’s secret loan and forged signature are exposed through Krogstad’s letter; she eventually leaves her husband Torvald.",
      ],
      [
        "Hedda Gabler",
        "The title character burns Eilert Løvborg’s manuscript and becomes trapped by Judge Brack’s knowledge of her pistol.",
      ],
    ],
  ],
  [
    "achebe",
    "Chinua Achebe",
    "Nigerian",
    "Achebe",
    [
      [
        "Things Fall Apart",
        "Okonkwo’s standing in Umuofia collapses as colonial administration and Christian missionaries transform Igbo society.",
      ],
      [
        "No Longer at Ease",
        "Obi Okonkwo returns from studying in England and becomes entangled in corruption as a Nigerian civil servant.",
      ],
    ],
  ],
  [
    "soyinka",
    "Wole Soyinka",
    "Nigerian",
    "Soyinka",
    [
      [
        "Death and the King’s Horseman",
        "Elesin’s ritual duty after his king’s death is interrupted by the colonial officer Pilkings.",
      ],
      [
        "The Lion and the Jewel",
        "The schoolteacher Lakunle and the village chief Baroka compete for Sidi’s hand.",
      ],
    ],
  ],
  [
    "mahfouz",
    "Naguib Mahfouz",
    "Egyptian",
    "Mahfouz",
    [
      [
        "The Cairo Trilogy",
        "The family of the patriarch Ahmad Abd al-Jawad is followed across three generations in Palace Walk, Palace of Desire, and Sugar Street.",
      ],
      [
        "Midaq Alley",
        "Residents of a small Cairo street include the ambitious Hamida and the barber Abbas.",
      ],
    ],
  ],
  [
    "murasaki",
    "Murasaki Shikibu",
    "Japanese",
    "Murasaki|Shikibu",
    [
      [
        "The Tale of Genji",
        "The “shining prince,” son of an emperor, navigates romantic relationships and court life in Heian Japan.",
      ],
    ],
  ],
  [
    "soseki",
    "Natsume Sōseki",
    "Japanese",
    "Sōseki|Soseki|Natsume",
    [
      [
        "Kokoro",
        "A young narrator befriends a man known as Sensei, whose testament reveals his guilt over a friend called K.",
      ],
      [
        "I Am a Cat",
        "A nameless feline satirically observes the household of the teacher Kushami and the intellectual pretensions of its human visitors.",
      ],
    ],
  ],
  [
    "kawabata",
    "Yasunari Kawabata",
    "Japanese",
    "Kawabata",
    [
      [
        "Snow Country",
        "Shimamura travels through a tunnel into a snowy region and becomes involved with the geisha Komako.",
      ],
      [
        "Thousand Cranes",
        "Kikuji becomes entangled with his dead father’s former lovers in a story shaped by tea ceremony imagery.",
      ],
    ],
  ],
  [
    "mishima",
    "Yukio Mishima",
    "Japanese",
    "Mishima",
    [
      [
        "The Temple of the Golden Pavilion",
        "The stuttering novice Mizoguchi is obsessed with a beautiful Kyoto temple and ultimately sets it on fire.",
      ],
      [
        "The Sailor Who Fell from Grace with the Sea",
        "Noboru and a gang of boys become disillusioned with the sailor Ryuji after he enters a relationship with Noboru’s mother.",
      ],
    ],
  ],
  [
    "lu-xun",
    "Lu Xun",
    "Chinese",
    "Lu Xun|Lu Hsun",
    [
      [
        "“A Madman’s Diary”",
        "A paranoid diarist reads between the lines of Chinese history and sees the command to eat people.",
      ],
      [
        "The True Story of Ah Q",
        "A poor laborer repeatedly reinterprets his humiliations as spiritual victories.",
      ],
    ],
  ],
  [
    "cao",
    "Cao Xueqin",
    "Chinese",
    "Cao Xueqin|Tsao Hsueh",
    [
      [
        "Dream of the Red Chamber",
        "Jia Baoyu, born with a piece of jade, is torn between Lin Daiyu and Xue Baochai as the Jia family declines.",
      ],
    ],
  ],
  [
    "tagore",
    "Rabindranath Tagore",
    "Indian",
    "Tagore",
    [
      [
        "Gitanjali",
        "This Bengali poet’s collection of devotional songs appeared in English as Song Offerings.",
      ],
      [
        "The Home and the World",
        "Bimala is drawn between her husband Nikhil’s ideals and Sandip’s aggressive nationalism during the Swadeshi movement.",
      ],
    ],
  ],
  [
    "rushdie",
    "Salman Rushdie",
    "Indian",
    "Rushdie",
    [
      [
        "Midnight’s Children",
        "Saleem Sinai is born at the instant of Indian independence and has a telepathic connection with other children born in the same hour.",
      ],
      [
        "The Satanic Verses",
        "Gibreel Farishta and Saladin Chamcha survive an exploding airliner and undergo supernatural transformations.",
      ],
    ],
  ],
  [
    "pamuk",
    "Orhan Pamuk",
    "Turkish",
    "Pamuk",
    [
      [
        "My Name Is Red",
        "A murder among Ottoman miniaturists is narrated from many perspectives, including a coin, a dog, and a color.",
      ],
      [
        "Snow",
        "The poet Ka travels to Kars, where a snowstorm isolates the city amid religious and political conflict.",
      ],
    ],
  ],
  [
    "sienkiewicz",
    "Henryk Sienkiewicz",
    "Polish",
    "Sienkiewicz",
    [
      [
        "Quo Vadis",
        "The Roman patrician Marcus Vinicius falls in love with the Christian Lygia during the reign of Nero.",
      ],
    ],
  ],
  [
    "poe",
    "Edgar Allan Poe",
    "American",
    "Poe",
    [
      [
        "“The Fall of the House of Usher”",
        "An unnamed narrator visits Roderick and Madeline in a decaying ancestral mansion, which splits and sinks into a tarn.",
      ],
      [
        "“The Cask of Amontillado”",
        "Montresor lures Fortunato into the catacombs with the promise of a rare wine and walls him up alive.",
      ],
    ],
  ],
  [
    "twain",
    "Mark Twain",
    "American",
    "Twain|Samuel Clemens",
    [
      [
        "Adventures of Huckleberry Finn",
        "A boy and the escaped slave Jim travel down the Mississippi on a raft and encounter the con men called the Duke and the King.",
      ],
      [
        "A Connecticut Yankee in King Arthur’s Court",
        "The engineer Hank Morgan finds himself in medieval England and uses knowledge of a solar eclipse to escape execution.",
      ],
    ],
  ],
  [
    "hawthorne",
    "Nathaniel Hawthorne",
    "American",
    "Hawthorne",
    [
      [
        "The Scarlet Letter",
        "Hester Prynne wears a symbol of adultery while Arthur Dimmesdale conceals his guilt and Roger Chillingworth seeks revenge.",
      ],
      [
        "The House of the Seven Gables",
        "The Pyncheon family inhabits an ancestral house overshadowed by the curse of Matthew Maule.",
      ],
    ],
  ],
  [
    "frost",
    "Robert Frost",
    "American",
    "Frost",
    [
      [
        "“Mending Wall”",
        "Two neighbors repair a boundary, and one repeats the saying that good fences make good neighbors.",
      ],
      [
        "“Birches”",
        "The speaker imagines a boy bending trees and longs to climb away from earth for a while before returning to it.",
      ],
    ],
  ],
  [
    "eliot-ts",
    "T. S. Eliot",
    "British",
    "T. S. Eliot|TS Eliot|Thomas Stearns Eliot",
    [
      [
        "The Waste Land",
        "This poem begins by calling April the cruelest month and moves through sections including “A Game of Chess” and “Death by Water.”",
      ],
      [
        "“The Love Song of J. Alfred Prufrock”",
        "An anxious speaker measures his life in coffee spoons and imagines that the mermaids will not sing to him.",
      ],
    ],
  ],
  [
    "bronte-charlotte",
    "Charlotte Brontë",
    "British",
    "Charlotte Brontë|Charlotte Bronte",
    [
      [
        "Jane Eyre",
        "A governess at Thornfield falls in love with Rochester, whose wife Bertha Mason is secretly confined in the house.",
      ],
      [
        "Villette",
        "Lucy Snowe travels to a French-speaking city and teaches at Madame Beck’s school, where she grows close to Paul Emanuel.",
      ],
    ],
  ],
  [
    "wordsworth",
    "William Wordsworth",
    "British",
    "Wordsworth",
    [
      [
        "The Prelude",
        "This autobiographical poem traces the growth of a poet’s mind and includes a childhood episode of stealing a boat.",
      ],
      [
        "“Tintern Abbey”",
        "Returning to the banks of the Wye after five years, the speaker reflects on memory, nature, and his sister Dorothy.",
      ],
    ],
  ],
  [
    "keats",
    "John Keats",
    "British",
    "Keats",
    [
      [
        "“Ode on a Grecian Urn”",
        "The speaker addresses a silent artifact depicting lovers who can never kiss and ends with a statement equating beauty and truth.",
      ],
      [
        "“Ode to a Nightingale”",
        "The speaker imagines escaping on the wings of poetry while hearing the song of a bird that seems beyond mortality.",
      ],
    ],
  ],
  [
    "blake",
    "William Blake",
    "British",
    "Blake",
    [
      [
        "Songs of Innocence and of Experience",
        "This paired poetry collection contains contrasting chimney-sweeper poems as well as “The Lamb” and “The Tyger.”",
      ],
      [
        "The Marriage of Heaven and Hell",
        "This illuminated work contains the “Proverbs of Hell” and declares energy to be eternal delight.",
      ],
    ],
  ],
  [
    "chaucer",
    "Geoffrey Chaucer",
    "British",
    "Chaucer",
    [
      [
        "The Canterbury Tales",
        "Pilgrims gather at the Tabard Inn, and their host Harry Bailly proposes a storytelling contest.",
      ],
      [
        "Troilus and Criseyde",
        "Pandarus helps arrange a Trojan prince’s love affair, but Criseyde later transfers her affection to Diomede.",
      ],
    ],
  ],
  [
    "conrad",
    "Joseph Conrad",
    "British",
    "Conrad",
    [
      [
        "Heart of Darkness",
        "Marlow recounts a journey up an African river to find the ivory trader Kurtz.",
      ],
      [
        "Lord Jim",
        "A young officer abandons the pilgrim ship Patna and later tries to rebuild his honor in Patusan.",
      ],
    ],
  ],
  [
    "moliere",
    "Molière",
    "French",
    "Molière|Moliere|Jean-Baptiste Poquelin",
    [
      [
        "Tartuffe",
        "The religious hypocrite of the title deceives Orgon and attempts to seduce his wife Elmire.",
      ],
      [
        "The Misanthrope",
        "Alceste insists on absolute sincerity but is in love with the socially adept Célimène.",
      ],
    ],
  ],
  [
    "balzac",
    "Honoré de Balzac",
    "French",
    "Balzac",
    [
      [
        "Père Goriot",
        "At Madame Vauquer’s boarding house, Eugène de Rastignac observes a retired merchant’s ruinous devotion to his daughters.",
      ],
      [
        "Eugénie Grandet",
        "The daughter of a wealthy miser in Saumur gives her savings to her cousin Charles, who later abandons his promise to marry her.",
      ],
    ],
  ],
  [
    "voltaire",
    "Voltaire",
    "French",
    "Voltaire|François-Marie Arouet",
    [
      [
        "Candide",
        "A student of Pangloss travels through disasters that challenge the claim that this is the best of all possible worlds.",
      ],
      [
        "Zadig",
        "A Babylonian philosopher’s misfortunes and successes form a satirical tale about providence and justice.",
      ],
    ],
  ],
  [
    "zola",
    "Émile Zola",
    "French",
    "Zola",
    [
      [
        "Germinal",
        "Étienne Lantier becomes involved in a coal miners’ strike in northern France.",
      ],
      [
        "Nana",
        "A stage performer and courtesan rises through Parisian society and ruins men drawn to her.",
      ],
    ],
  ],
  [
    "solzhenitsyn",
    "Aleksandr Solzhenitsyn",
    "Russian",
    "Solzhenitsyn",
    [
      [
        "One Day in the Life of Ivan Denisovich",
        "The prisoner Shukhov navigates a single winter day in a Soviet labor camp.",
      ],
      [
        "The Gulag Archipelago",
        "This work draws on testimony and personal experience to examine the Soviet system of prisons and forced-labor camps.",
      ],
    ],
  ],
  [
    "murakami",
    "Haruki Murakami",
    "Japanese",
    "Haruki Murakami",
    [
      [
        "The Wind-Up Bird Chronicle",
        "Toru Okada searches for a missing cat and his wife Kumiko; a dry well becomes an important place of isolation and discovery.",
      ],
      [
        "Kafka on the Shore",
        "The runaway Kafka Tamura’s narrative alternates with that of Nakata, a man who can speak with cats.",
      ],
    ],
  ],
  [
    "atwood",
    "Margaret Atwood",
    "Canadian",
    "Atwood",
    [
      [
        "The Handmaid’s Tale",
        "Offred serves a Commander in Gilead, a theocracy that forces fertile women into reproductive servitude.",
      ],
      [
        "The Blind Assassin",
        "Iris Chase narrates her family history; a novel attributed to her sister Laura contains a science-fiction story within a story.",
      ],
    ],
  ],
  [
    "homer",
    "Homer",
    "Ancient Greek",
    "Homer",
    [
      [
        "Iliad",
        "The wrath of Achilles follows his quarrel with Agamemnon; Patroclus dies at Hector’s hands during the Trojan War.",
      ],
      [
        "Odyssey",
        "A wandering king encounters the Cyclops Polyphemus and returns to Ithaca to reclaim his home from Penelope’s suitors.",
      ],
    ],
  ],
];

export const AUTHORS = literature.map(([id, name, nation, aliases, works]) => ({
  id,
  name,
  nation,
  aliases: aliases.split("|"),
  works: works.map(([title, clue]) => ({ title, clue })),
}));

export const MATH_TOPICS = [
  [
    "calculus",
    "Calculus",
    [
      [
        "Mean value theorem",
        "If f is continuous on [a,b] and differentiable on (a,b), there is a c in (a,b) with f′(c) = (f(b) − f(a))/(b − a).",
      ],
      [
        "Fundamental theorem of calculus",
        "This theorem connects differentiation and integration: an integral with a variable upper endpoint gives an antiderivative of a continuous integrand.",
      ],
      [
        "Taylor series",
        "This expansion uses the nth derivative at a point, divided by n factorial, as the coefficient of the nth power of the displacement.",
      ],
    ],
  ],
  [
    "algebra",
    "Algebra & number theory",
    [
      [
        "Lagrange’s theorem",
        "In a finite group, the order of every subgroup divides the order of the group.",
      ],
      [
        "Fermat’s little theorem",
        "For a prime p and an integer a not divisible by p, a raised to p − 1 is congruent to 1 modulo p.",
      ],
      [
        "Chinese remainder theorem",
        "For pairwise coprime moduli, a system of congruences has a unique solution modulo their product.",
      ],
      [
        "Galois theory",
        "This theory relates field extensions to groups of automorphisms and characterizes solvability by radicals.",
      ],
    ],
  ],
  [
    "linear",
    "Linear algebra",
    [
      [
        "Eigenvector",
        "A nonzero vector v with Av = λv is called this; λ is its corresponding eigenvalue.",
      ],
      [
        "Rank–nullity theorem",
        "For a linear map on a finite-dimensional domain, the dimension of the kernel plus the dimension of the image equals the dimension of the domain.",
      ],
      [
        "Cayley–Hamilton theorem",
        "Every square matrix satisfies its own characteristic polynomial.",
      ],
    ],
  ],
  [
    "geometry",
    "Geometry & topology",
    [
      [
        "Euler characteristic",
        "For a convex polyhedron this invariant is V − E + F = 2; for a closed orientable surface of genus g it is 2 − 2g.",
      ],
      [
        "Pythagorean theorem",
        "For a right triangle, the square of the hypotenuse equals the sum of the squares of the other two sides.",
      ],
      [
        "Möbius strip",
        "This non-orientable surface with one boundary component can be made by joining the ends of a strip after a half twist.",
      ],
      [
        "Brouwer fixed-point theorem",
        "Every continuous map from a closed ball in Euclidean space to itself has a point that maps to itself.",
      ],
    ],
  ],
  [
    "probability",
    "Probability & statistics",
    [
      [
        "Bayes’ theorem",
        "This rule expresses P(A | B) as P(B | A)P(A) divided by P(B), when P(B) is positive.",
      ],
      [
        "Central limit theorem",
        "Under standard independence and finite-variance assumptions, a properly normalized sum converges in distribution to a normal random variable.",
      ],
      [
        "Poisson distribution",
        "This discrete distribution has probability mass e^(−λ) λ^k / k! and has both mean and variance λ.",
      ],
      [
        "Bernoulli distribution",
        "This distribution models a single trial with outcomes 0 and 1, with probabilities 1 − p and p.",
      ],
    ],
  ],
  [
    "discrete",
    "Discrete mathematics",
    [
      [
        "Pigeonhole principle",
        "If more than n objects are placed into n boxes, at least one box must contain more than one object.",
      ],
      [
        "Eulerian circuit",
        "This closed walk traverses every edge exactly once; a connected undirected graph with edges has one exactly when every vertex has even degree.",
      ],
      [
        "Cantor’s diagonal argument",
        "This technique constructs an object differing from the nth entry at its nth position and proves that the real numbers are uncountable.",
      ],
      [
        "Inclusion–exclusion principle",
        "To count the union of finite sets, add single-set sizes, subtract pairwise intersections, then add triple intersections, continuing with alternating signs.",
      ],
    ],
  ],
].map(([id, name, entries]) => ({ id, name, entries }));

export const NATIONS = [
  ...new Set(AUTHORS.map((author) => author.nation)),
].sort();

export const CLUE_CARDS = [
  ...AUTHORS.flatMap((author) => [
    {
      id: `clue:${author.id}:author`,
      subject: "literature",
      authorId: author.id,
      nation: author.nation,
      topic: "Author",
      question: `Name the author of ${author.works.map((work) => work.title).join(" and ")}.`,
      answer: author.name,
      explanation: author.works
        .map((work) => `${work.title}: ${work.clue}`)
        .join("\n\n"),
    },
    ...author.works.map((work, i) => ({
      id: `clue:${author.id}:${i}`,
      subject: "literature",
      authorId: author.id,
      nation: author.nation,
      topic: "Work",
      question: `${work.clue}\n\nName the work.`,
      answer: work.title,
      explanation: `${author.name} · ${author.nation} literature`,
    })),
  ]),
  ...MATH_TOPICS.flatMap((topic) =>
    topic.entries.map(([answer, question], i) => ({
      id: `clue:math:${topic.id}:${i}`,
      subject: "math",
      topicId: topic.id,
      topic: topic.name,
      question: `${question}\n\nName the mathematical concept or result.`,
      answer,
      explanation: `${topic.name} · Try stating the result in your own words before moving on.`,
    })),
  ),
];

export const DIFFICULTIES = {
  all: { name: "All levels", values: "" },
  beginner: { name: "Introductory", values: "1,2,3" },
  highschool: { name: "High school", values: "4,5" },
  college: { name: "College", values: "6,7" },
  open: { name: "Open / advanced", values: "8,9,10" },
};

// QB Reader groups most national literatures into broader subcategories.
// Exact national practice is narrowed using the curated author catalog.
export const SUBCATEGORY = {
  American: "American Literature",
  British: "British Literature",
  Irish: "British Literature",
  Russian: "European Literature",
  French: "European Literature",
  German: "European Literature",
  "German-language": "European Literature",
  Spanish: "European Literature",
  Italian: "European Literature",
  Portuguese: "European Literature",
  Norwegian: "European Literature",
  Polish: "European Literature",
  "Ancient Greek": "Classical Literature",
  Japanese: "World Literature",
  Chinese: "World Literature",
  Indian: "World Literature",
  Nigerian: "World Literature",
  Egyptian: "World Literature",
  Canadian: "World Literature",
  Turkish: "World Literature",
  Colombian: "World Literature",
  Argentine: "World Literature",
  Chilean: "World Literature",
};
