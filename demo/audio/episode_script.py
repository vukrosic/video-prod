"""Narration for episode 1 after the cold open, split into lines.

Each line is (id, text, pause_before_seconds). A line is one TTS call, so it keeps natural prosody; split
wherever the picture needs a cut. Numbers are written the way they should be spoken. Source of truth for
the wording: scripts/01-survive-every-era/script.md.
"""

# Seconds of silence before a section's first line, for the era transition.
SECTION_PAUSE = 2.8

SECTIONS = [
    dict(id="rules", pause=1.2, lines=[
        ("r1", "Here are the rules.", 0),
        ("r2", "You show up in normal clothes, with no tools, no food, and no spacesuit.", 0.3),
        ("r3", "You arrive on land, or on the closest thing to land that exists.", 0.4),
        ("r4", "We start the clock when you arrive, and stop it when you die.", 0.4),
        ("r5", "Earth has existed for four and a half billion years. You'd think a planet where humans evolved "
               "would be a pretty good place for humans, for most of that time.", 0.6),
        ("r6", "You would be wrong.", 0.7),
    ]),
    dict(id="hadean", lines=[
        ("h1", "Half a billion years later, the magma has cooled. There's solid ground, and there are oceans. "
               "There's water.", 0),
        ("h2", "And look up: the Moon.", 0.6),
        ("h3", "It formed much closer to Earth, and has been drifting away ever since. Right now it looks "
               "several times bigger than the Moon you know.", 0.9),
        ("h4", "Its pull is so strong that the tides are enormous, and Earth spins so fast that a day lasts "
               "only a fraction of twenty-four hours.", 0.5),
        ("h5", "It's beautiful. Enjoy it while you hold your breath, because there is no oxygen here. The air "
               "is mostly carbon dioxide and nitrogen, and it's thick and heavy.", 0.6),
        ("h6", "You can hold your breath for maybe a minute. Then your body forces you to breathe.", 0.5),
        ("h7", "When you breathe in air with no oxygen, it doesn't just fail to help you. It pulls oxygen out "
               "of your blood. You're unconscious within seconds.", 0.3),
        ("h8", "Two minutes. That's a big improvement!", 1.0),
        ("h9", "It's also as good as it's going to get, for a very, very long time.", 0.4),
    ]),
    dict(id="archean", lines=[
        ("a1", "Something has changed. There is life.", 0),
        ("a2", "These domes are cities of microbes, some of the first living things on Earth. You're looking "
               "at your extremely distant relatives.", 0.5),
        ("a3", "The Sun is weaker, only about three-quarters as bright as today.", 0.6),
        ("a4", "Scientists still argue about why Earth wasn't frozen solid. The best guess is that huge "
               "amounts of greenhouse gases kept it warm. The sky may even have had an orange haze, from "
               "methane.", 0.4),
        ("a5", "The one thing that hasn't changed is the air. There's still no oxygen.", 0.6),
        ("a6", "Life is here, and it can't help you.", 1.4),
    ]),
    dict(id="oxidation", lines=[
        ("o1", "Then some microbes invented something new: photosynthesis that uses sunlight and water, and "
               "releases oxygen as waste.", 0),
        ("o2", "For hundreds of millions of years, that oxygen got absorbed by iron in the oceans, which is "
               "why rocks from this time have bright red stripes of rust.", 0.5),
        ("o3", "Eventually the iron ran out, and oxygen started building up in the air.", 0.3),
        ("o4", "This was a disaster for most life on Earth. To the microbes that ruled the planet, oxygen was "
               "poison. It may be the first time life polluted its own planet.", 0.5),
        ("o5", "For you, it's great news. There's oxygen!", 0.6),
        ("o6", "A tiny amount of oxygen. Probably somewhere around one to ten percent of today's level.", 0.8),
        ("o7", "Even on the summit of Mount Everest, you get roughly the equivalent of seven percent oxygen, "
               "and most people need extra oxygen to survive there. This is far below that.", 0.5),
        ("o8", "A few more seconds, maybe. That's all.", 1.3),
    ]),
    dict(id="boring", lines=[
        ("b1", "What comes next is a period geologists call, quite literally, the Boring Billion.", 0),
        ("b2", "For about a billion years, almost nothing happens. Oxygen stays low. Life stays mostly "
               "microscopic.", 0.4),
        ("b3", "The biggest change is that days slowly get longer, as the Moon drifts away. One point four "
               "billion years ago, a day lasted about eighteen hours.", 0.5),
        ("b4", "Let's step back and look at the whole picture.", 0.6),
        ("b5", "Out of Earth's four and a half billion years, you'd suffocate within minutes for about four "
               "billion of them.", 1.0),
        ("b6", "For almost ninety percent of Earth's history, this planet would kill you before you finished "
               "reading this sentence.", 0.4),
        ("b7", "But things are about to get dramatic.", 0.8),
    ]),
    dict(id="snowball", lines=[
        ("s1", "Six hundred and fifty million years ago, Earth froze.", 0),
        ("s2", "Ice sheets may have reached all the way to the equator. From space, the planet would look like "
               "a giant snowball, and that's exactly what scientists call it: Snowball Earth.", 0.6),
        ("s3", "Oxygen was rising around this time, but probably not enough yet. You'd still suffocate in "
               "minutes.", 0.8),
        ("s4", "And even if someone handed you an oxygen tank, your t-shirt would lose to the cold. With "
               "temperatures far below freezing and no shelter, you'd freeze to death within hours.", 0.5),
        ("s5", "Still, something important happened in this frozen world. When the ice finally melted, life "
               "exploded.", 1.2),
    ]),
    dict(id="cambrian", lines=[
        ("c1", "Five hundred and twenty million years ago. You arrive, take a breath, and wait.", 0),
        ("c2", "Three minutes.", 1.0),
        ("c3", "Four.", 0.7),
        ("c4", "Five.", 0.7),
        ("c5", "You're breathing.", 1.2),
        ("c6", "The air is probably still thinner than today's. It might feel like standing on a high "
               "mountain: dizzy, short of breath, with a headache. Scientists are still debating exactly how "
               "much oxygen there was.", 1.0),
        ("c7", "But for the first time in this video, you're alive.", 0.4),
        ("c8", "So now you have new problems.", 0.8),
        ("c9", "Look around. There are no plants on land. No grass, no trees, no soil, no insects. The "
               "continents are bare rock.", 0.5),
        ("c10", "There is no wood, so there's no fire. There's no shelter, except the rocks.", 0.3),
        ("c11", "All life is in the sea, and it's having a party. This is the Cambrian Explosion, when most of "
                "the major animal groups that exist today appear in the fossil record, in a geologic "
                "eyeblink.", 0.6),
        ("c12", "Trilobites crawl across the seafloor, and swimming above them is Anomalocaris, one of the first "
                "big predators.", 0.4),
        ("c13", "Your only food is in the water. You'd have to catch shellfish and trilobites with your bare "
                "hands, and eat them raw, with no idea whether they're poisonous.", 0.6),
        ("c14", "With a lot of luck, and a lot of trilobites, you might last a few weeks.", 0.6),
        ("c15", "Your first real survival story.", 0.5),
    ]),
    dict(id="carboniferous", lines=[
        ("k1", "Three hundred million years ago, plants have conquered the land. Enormous swamp forests cover "
               "the continents.", 0),
        ("k2", "Take a deep breath. The air might be around thirty to thirty-five percent oxygen, far more than "
               "today's twenty-one percent. You feel great.", 0.6),
        ("k3", "The insects feel great too. Oxygen levels this high may be part of why insects could grow so "
               "large.", 0.5),
        ("k4", "That's a dragonfly, with a wingspan of about seventy centimeters.", 0.3),
        ("k5", "And that's a millipede called Arthropleura, up to two and a half meters long. It's thought to "
               "have been a plant-eater, which is lucky for you.", 0.6),
        ("k6", "There's food: amphibians, fish, early reptiles. There's firewood everywhere. You could build a "
               "shelter.", 0.6),
        ("k7", "There aren't even any germs that evolved to infect humans. The diseases that plague us today "
               "won't exist for hundreds of millions of years.", 0.3),
        ("k8", "But all that oxygen has a dark side: fire.", 0.7),
        ("k9", "With this much oxygen, even damp plants can burn. A single lightning strike can set off a "
               "wildfire that races through the forest.", 0.5),
        ("k10", "If you stay near water, and keep your fire under control, you could honestly live here a long "
                "time.", 0.8),
        ("k11", "This might be the best era so far. Let's see if the good times last.", 0.6),
    ]),
    dict(id="dying", pause=1.4, lines=[
        ("d1", "They don't.", 0),
        ("d2", "Two hundred and fifty-two million years ago, in what is now Siberia, volcanic eruptions poured "
               "out enough lava to cover an area the size of a continent, over hundreds of thousands of years.",
         1.6),
        ("d3", "They released gigantic amounts of carbon dioxide.", 0.3),
        ("d4", "The planet overheated. The oceans lost their oxygen. Near the equator, sea temperatures may "
               "have reached around forty degrees Celsius, the temperature of a hot bath. On land, it may have "
               "been even hotter.", 0.6),
        ("d5", "This is the Permian-Triassic extinction, also called the Great Dying. Around ninety percent of "
               "all marine species, and most land animals, disappeared.", 0.6),
        ("d6", "It's the worst mass extinction in Earth's history.", 0.3),
        ("d7", "Arrive near the equator, and the heat could kill you within hours.", 0.8),
        ("d8", "Earth would recover, but it took millions of years. And what came out the other side was a new "
               "world, ruled by reptiles.", 1.3),
    ]),
    dict(id="cretaceous", lines=[
        ("t1", "Sixty-six million years ago. The age of dinosaurs.", 0),
        ("t2", "This time, let's say you're lucky. You arrive somewhere quiet. You've learned to fish. You've "
               "learned which plants make you sick.", 0.6),
        ("t3", "You've learned that you are, basically, a snack-sized mammal, and that the smart move is to "
               "avoid being seen by anything with big teeth.", 0.3),
        ("t4", "You've survived for a whole year. This is by far your best run.", 0.7),
        ("t5", "One afternoon, a new star appears in the sky.", 1.2),
        ("t6", "It's an asteroid, about ten kilometers wide, heading for what is now Mexico.", 1.6),
        ("t7", "Where it hits, everything is vaporized instantly.", 0.8),
        ("t8", "Across the planet, debris thrown into space falls back through the atmosphere. Some scientists "
               "think the sky may have glowed hot enough to start fires across entire continents.", 1.4),
        ("t9", "Then comes the dark: soot and dust block out the Sun for months, or even years. Plants die. "
               "Then the animals that eat plants. Then the animals that eat them.", 0.6),
        ("t10", "About three-quarters of all species on Earth die out.", 0.6),
        ("t11", "If you survive the first day, the dark winter will probably finish you off.", 0.8),
        ("t12", "But in the ashes, some small, furry animals made it through: our ancestors.", 1.2),
    ]),
    dict(id="iceage", lines=[
        ("i1", "Twenty thousand years ago. The last Ice Age is at its peak.", 0),
        ("i2", "So much water is locked in ice that sea levels are about a hundred and twenty meters lower "
               "than today.", 0.3),
        ("i3", "And for the first time, you're not alone.", 0.8),
        ("i4", "Those are humans, exactly like you.", 0.6),
        ("i5", "If they welcome you, you could actually live here, possibly for the rest of your life. You'd be "
               "clumsy at first. You'd need to learn to hunt, make tools and build fires. But this is the world "
               "your body was built for.", 0.6),
        ("i6", "There's just one twist. You might be more dangerous to them than they are to you.", 0.9),
        ("i7", "Many of the diseases we carry today are young. Measles, for example, probably only appeared a "
               "few thousand years ago, after people started living close to farm animals. Your immune system "
               "has seen things theirs never has.", 0.6),
        ("i8", "Maybe a lifetime. If you're careful, and they're lucky.", 0.9),
    ]),
    dict(id="today", lines=[
        ("y1", "And now you're here. Today, the timer shows a whole lifetime.", 0),
        ("y2", "Squeeze Earth's entire history into a single day.", 1.0),
        ("y3", "For the first twenty-one hours or so, you couldn't breathe.", 0.6),
        ("y4", "You could only survive without protection in roughly the last two or three hours.", 0.4),
        ("y5", "Humans like us have existed for about the last five seconds.", 0.6),
        ("y6", "And the window isn't open forever. The Sun is slowly getting brighter. In roughly a billion "
               "years, it will be too hot for oceans, and the timer will start shrinking again, back toward "
               "one second.", 1.2),
        ("y7", "We didn't just get lucky to be alive. We showed up during the short window when this planet "
               "lets us live on it with nothing but a t-shirt.", 1.4),
        ("y8", "Enjoy the air. It took four billion years to make.", 1.0),
    ]),
]

END_CARD_SECONDS = 7.0
