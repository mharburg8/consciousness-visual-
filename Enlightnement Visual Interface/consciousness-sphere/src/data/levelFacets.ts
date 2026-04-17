export type LevelFacets = {
  experience: string;
  veil: string;
  dissolving: string;
  signs: string;
};

export const LEVEL_FACETS: Record<string, LevelFacets> = {

  // ─── 3rd Dimension ────────────────────────────────────────────────────────

  Shame: {
    experience: `Shame is the most contracted state available to human consciousness. It doesn't feel like an emotion — it feels like a verdict. Not "I did something wrong" but "I am wrong." The self collapses inward, away from visibility, away from contact. Humiliation is its signature: the sense of being exposed as fundamentally inadequate, seen and found wanting in a way that can never be undone.

In shame, the body disappears or becomes the enemy. You want to shrink, to vanish, to stop taking up space. Social withdrawal follows naturally — if others could truly see you, they would confirm what you already know. So you become careful, hidden, small.

This is one of the most painful places to inhabit, and one of the most silent. Shame doesn't announce itself loudly. It whispers its verdict constantly and then goes quiet, leaving only the weight.`,

    veil: `The veil of shame is the belief that the verdict is accurate. That the humiliation reveals the truth about you, rather than the truth about a wound. The mind has constructed an entire identity around the story of inadequacy — and that identity, however painful, is known. Familiar. Paradoxically safe.

There is also the isolation mechanism: shame convinces you that your specific inadequacy is unique, unreachable by others, unpresentable. The thought "no one else feels this" keeps the wound sealed and prevents the contact that would begin to heal it.

You are not being asked to reject the experience. Only to question whether it is the final word about who you are.`,

    dissolving: `Shame dissolves through witnessed acknowledgment — not performance or confession, but the experience of being seen in the wound and not rejected. A therapist who doesn't flinch. A group where others carry the same thing. A friend who says "me too" and means it.

Writing about the shame without an audience — just the truth on the page — can begin to externalize it, to make it an object rather than the entire subject. What happened, what was said, what you concluded from it. The conclusion is the part to examine.

Somatic work helps because shame lives in the body — in the chronic downward posture, the held breath, the inward collapse. Practices that restore dignity in the body (martial arts, dance, movement therapy) work at the level where shame actually lives.

The most powerful solvent: the recognition, even once, that someone who really sees you still chooses to remain.`,

    signs: `You notice shame arising but you don't immediately disappear into it. There's a brief gap — enough to recognize it as shame rather than just as the truth.

You begin to tell someone something you've never told anyone. Not everything at once — but one thing, to one person, and survive the telling.

The chronic posture of shrinking begins to relax. Moments where you take up your full amount of space without apology.

The story of your fundamental inadequacy loses some of its authority. Not gone — but no longer the only story available.`,
  },

  Guilt: {
    experience: `Guilt is the belief that you are in permanent debt — to another person, to an ideal, to God, to the way things should have been. The ledger never balances. What you did wrong (or failed to do) is held against you by an internal prosecutor that neither forgives nor forgets.

Blame is its emotional signature — directed inward primarily, but often displaced outward. The person who lives in guilt is often both the accused and the judge, conducting endless internal trials that always reach the same verdict.

Unlike shame, which says "I am bad," guilt says "I did bad" — a subtler distinction than it sounds. But guilt that has been carried long enough begins to fuse with identity, collapsing back into shame. The accumulated weight of what you owe becomes indistinguishable from what you are.`,

    veil: `The veil of guilt is the belief that suffering for your wrongs is the same thing as making them right. That if you punish yourself enough, the debt will eventually be paid. This keeps the loop closed: wrong, guilt, self-punishment, brief relief, wrong again.

There is also a way in which guilt can function as a hidden form of control — if I am responsible for everything that went wrong, then I am also the one who could have made it right. The responsibility is painful, but it preserves a sense of agency in a situation where genuine helplessness was unbearable.

The deeper recognition is that guilt requires a fixed past and a self that is permanently defined by that past. Both of those are constructs.`,

    dissolving: `Genuine amends — not performance, not further self-punishment, but an actual attempt to address what was harmed — releases guilt in a way that self-punishment never can. This may mean apology, restitution, changed behavior going forward. It may mean accepting that the person is unavailable for amends and working with a therapist or spiritual director instead.

Forgiveness of self follows, not precedes, the taking of responsibility. In that order, it becomes possible. Reversed, it becomes spiritual bypass.

Examining the standard against which you found yourself guilty: was it your own genuine standard, or one inherited unexamined? Much guilt is owed to rules that were never freely chosen.

Working with a confessor, therapist, or trusted other who can hold both your wrongdoing and your worth simultaneously — without collapsing either — is particularly effective here.`,

    signs: `You begin to distinguish between remorse (appropriate response to having caused harm) and guilt (punishment loop). Remorse motivates repair; it doesn't require suffering.

The internal prosecutor speaks less frequently and with less total authority. You can hear it without fully believing it.

You notice you've done something wrong and responded to it functionally — acknowledged it, attempted repair, moved forward — without the weeks of self-punishment that used to follow.

The past feels more like history and less like a live conviction.`,
  },

  Apathy: {
    experience: `Apathy is what happens when caring has been punished or disappointed long enough that the caring itself shuts down. It is not peaceful indifference — it is the exhaustion of someone who tried and failed so many times that trying has become indistinguishable from further wounding.

Despair is the emotional tone, but it's a quiet despair — not the acute pain of grief, but the dull gray absence of hope. The view of life is hopeless not because things are dramatically bad but because the future appears as an extension of a past that was not survivable by caring about it.

Inaction follows. Not laziness — a deeper paralysis. The body moves through the world, but the self has largely withdrawn from it. Things that used to matter have lost their pull. The question "why bother" doesn't produce a satisfying answer.`,

    veil: `The veil of apathy is its invisibility. Apathy presents itself not as a position but as an absence — as if there simply isn't anything worth caring about, rather than as a conclusion that was drawn after caring was repeatedly injured.

The protective function is real: if you stop wanting, you stop losing. The numbness that apathy provides is genuine relief from a pattern of hope-followed-by-devastation. To begin caring again is to risk that pattern resuming. The protection makes sense. It is also slowly suffocating.

Underneath the flatness is usually a deep exhaustion — sometimes grief, sometimes fear, sometimes rage that was turned inward because outward expression felt too dangerous. Apathy is often the surface of a much more active inner state that has gone underground.`,

    dissolving: `Apathy responds to micro-action — the smallest possible step toward something, not as a grand intention but as a single concrete act. Make one phone call. Walk around the block. Cook one thing. The scale must be matched to the current energy, not to what seems like it should be possible.

Physical movement matters here perhaps more than anywhere. The body holds the shutdown, and it can also begin the restart. Regular, predictable physical activity — even minimal — begins to restore some access to the nervous system that apathy has dampened.

Connection, even unwanted, often helps. Apathy isolates, and isolation deepens apathy. A structure that brings you into contact with others — not necessarily with emotional demand, but simply presence — interrupts the loop.

Working with the underlying layer: grief, fear, or suppressed anger that the apathy is covering. Therapy that can safely access these without flooding is often the gateway.`,

    signs: `Brief flickers of interest appear — fleeting, easily dismissed, but real. Something catches your attention for a moment before the flatness returns. Those flickers are significant.

You notice irritation where there used to be nothing. Irritation is a sign that something in you still cares enough to be bothered.

Small actions become possible again — not joyful, but possible. The gap between intending something small and doing it begins to narrow.

You find yourself wanting something. Even a small thing — a particular food, a particular quiet. Wanting, however modest, is the beginning of return.`,
  },

  Grief: {
    experience: `Grief is love that has nowhere to go. The object of attachment — a person, a relationship, a version of yourself, a future that was counted on — is gone, and the love that was oriented toward it has not gone with it. It remains, aching, searching, encountering absence where presence used to be.

Regret is grief's companion: the accounting of what was left unsaid, undone, unlived. The mind returns again and again to the threshold moments where things might have been different. This is not productive rumination — it is the heart trying to locate an exit from loss that doesn't exist.

Grief is not pathological. It is the appropriate response to loss. The problem is not grief itself but the ways it gets suppressed, rushed, shamed, or buried — turned instead into depression, addiction, or numbness. Grief that is allowed to move, moves. Grief that is not allowed to move, stays.`,

    veil: `The veil of grief is the attachment to the lost object itself — the way the mind clings to memory, replays it, refuses to let the relationship with what is gone evolve into something new. Not because the love is wrong, but because the form of the love has not yet updated to match a reality in which what was loved is no longer present in the same way.

There is also the secondary grief about grieving — the shame of still being sad, the social pressure to "move on," the self-judgment about not being further along. This meta-layer traps the primary grief and prevents it from completing its motion.

The deepest veil: the belief that completing the grief means abandoning what was loved. In reality, grief completes into something else entirely — a kind of love that doesn't require the other to be present in a particular form.`,

    dissolving: `Grief needs witness and ritual. A trusted person, a therapist, a grief circle — someone who can be present while the grief moves without trying to fix or rush it. The role of the witness is simply to stay.

Ritual creates containers: funerals, memorials, anniversary practices, writing letters to what was lost. These are technologies for giving grief structure and permission. Their antiquity is evidence of their usefulness.

The body needs to participate: crying without interruption, wailing if it comes, physical expression that matches the internal scale of loss. Exercise, especially rhythmic movement, supports the processing.

Creative expression — writing, painting, music — gives grief a form outside the self, which makes it examinable without being overwhelming.

Time matters. Grief has its own schedule, and it doesn't consult yours. The most useful thing you can do is clear space for it to move through, without requiring it to be done by a particular date.`,

    signs: `The grief waves, when they come, are still strong — but they pass more completely. You come back to something like equilibrium afterward, rather than staying under.

You can speak about the loss without being engulfed by it. The story has some separation from you.

You notice you can remember what was good without it immediately colliding with the loss. Memory becomes more varied — not just the final moments or the worst moments.

Something new has begun to matter again. Not replacing what was lost, but genuinely mattering. The capacity to care is returning.`,
  },

  Fear: {
    experience: `Fear is the body's vigilance system in overdrive. The threat-detection mechanism that evolved to protect the organism has generalized: now it fires for social threat, imagined threat, memories of threat, anticipations of threat. The body tightens. The breath shallows. The mind narrows to the question: what is dangerous here, and how do I manage it?

Anxiety is fear without a clear object — a persistent physiological state of alarm searching for something to attach to. It makes the world appear frightening not because danger is present but because the nervous system has learned to assume it.

From fear, life looks threatening. Other people become potential sources of harm. The future becomes something to brace against. The constant expenditure of vigilance energy is exhausting — but the alternative, relaxing vigilance, feels more dangerous than exhaustion.`,

    veil: `The veil of fear is the identification of safety with control. If I can predict, prepare, and protect against every contingency, then I will be safe. But perfect control is unavailable, which means the project is endless and the safety is never quite secured.

Underneath most chronic fear is an early experience — often preverbal — in which something genuinely threatening happened, and the nervous system drew the appropriate conclusion: be ready, always. The conclusion was accurate then. It has been applied ever since to situations that don't match the original threat.

The veil is also the story: "the world is dangerous, I am vulnerable, I must be vigilant." Each of these is sometimes true. None of them is always true. But fear presents them as permanent facts rather than contextual assessments.`,

    dissolving: `The nervous system heals through safe, repeated experience of the thing feared followed by the absence of catastrophe. This is the principle behind exposure therapy — not flooding, but gradual, titrated contact with what triggers the alarm, in a context of support, until the alarm learns to modulate.

Somatic practices that regulate the nervous system: slow breathing (particularly extended exhale), cold water, vigorous physical movement, shaking, tremoring. These are the body's own tools for discharging the freeze-or-flee energy that fear accumulates.

Trauma-informed therapy reaches the layers below the narrative — the body memory, the early encoding. EMDR, somatic experiencing, and related approaches work directly with this.

Courage — not the absence of fear but movement despite it — gradually teaches the nervous system that the fear's predictions are not always accurate. Each small act of courage in the presence of fear is data for the nervous system.`,

    signs: `The fear still arises, but there's a slight delay before you believe it. A breath of space in which you can ask: is this actually dangerous right now?

Physical symptoms of anxiety begin to be recognizable as anxiety rather than as premonition. You can label the sensation, which already reduces its authority.

You do one thing that fear was preventing. Not the big thing — one small thing. And notice you survived.

Gradually, the world appears somewhat less threatening on average. The baseline vigilance drops a degree. You catch yourself relaxed in places where you used to be braced.`,
  },

  Desire: {
    experience: `Desire at this level of consciousness is not the clean wanting of someone oriented toward a genuine goal. It is craving — the burning certainty that the right acquisition, relationship, experience, or outcome will finally close the gap of incompleteness that defines this state. The hunger is structural, not situational: getting what you want brings only brief relief before the wanting resumes.

Craving is its emotional signature. The view of life is disappointing — not because things are objectively inadequate but because they persistently fail to deliver the satisfaction that was promised. The next thing is always more compelling than the current one. The present is always a waiting room.

This layer powers much of consumer culture, romantic obsession, and addictive behavior. The engine of seeking is running continuously, and the fuel — temporary satisfaction — requires constant replenishment.`,

    veil: `The veil is the belief that the right object will finally satisfy — that desire itself is not the problem, but that you simply haven't found the right thing yet. This belief is self-maintaining: when the desired thing fails to satisfy, the conclusion is not "this seeking structure is the problem" but "I need the next thing."

There is also the way desire defines identity. "I am someone who wants this" gives shape to a self that might otherwise feel formless or empty. The wanting provides direction, intensity, meaning — even if what is being wanted keeps changing.

The deeper recognition is that desire is often a displacement of a genuine longing — for connection, for wholeness, for the end of the sense of separation — onto objects that cannot deliver what the longing is actually about.`,

    dissolving: `The practice of pausing between arising desire and acting on it creates the space in which choice becomes possible. Not suppression — investigation. What is actually being sought here? What does this desire promise? Has it delivered before?

Contemplative practice — particularly practices that cultivate present-moment awareness — gradually undercuts the future-orientation of desire. When now is genuinely available, the reaching toward later loses some of its compulsive quality.

Working with the underlying sense of lack that desire is trying to fill: where did the sense of incompleteness come from? What experience taught you that you were not enough, or that what was present was not enough? These questions, met in therapy or in honest self-reflection, begin to address the root.

Service and contribution shift the attention outward from the acquiring self to what is actually needed in the world. This is not a cure for desire but a reorientation of energy that often reduces the intensity of craving.`,

    signs: `You notice desire arising and can observe it with some curiosity rather than being immediately captured by it. The flame is there, but you're not yet in it.

The cycle of desire-satisfaction-disappointment becomes visible as a cycle rather than a sequence of coincidences. You begin to recognize the pattern before you're fully inside it.

Brief moments of genuine contentment with what is already here — not resignation, but actual okayness with the present. These moments are notable precisely because they require nothing more.

The wanting still happens, but with somewhat less urgency. The gap between wanting and being is slightly less intolerable.`,
  },

  Anger: {
    experience: `Anger at this layer of consciousness is the experience of a world that continually violates what should be. Hate is its signature: not always directed at a specific person, sometimes a more ambient hostility — a conviction that the world is antagonistic, that others are to blame, that the rules are rigged or unfair. The energy is high and often confused with aliveness.

There is a kind of truth in anger: boundary violation is real, injustice is real, harm is real, and anger is the appropriate initial response to these. But anger at this level has generalized into a baseline orientation — a way of meeting the world that doesn't wait for specific violations to confirm it.

Anger turned outward becomes aggression, conflict, violence. Anger turned inward becomes depression. In either direction, it consumes enormous energy while solving the underlying situation in which it arose.`,

    veil: `The veil of anger is the belief that the anger is about what it appears to be about. That if the external situation were fixed — if the person apologized, if the injustice were remedied, if the obstacle were removed — the anger would resolve. Sometimes this is true. Often it isn't, and the next thing that violates what should be appears to generate the same response.

Chronic anger is almost always about something prior to its apparent object. The current frustration is the most recent expression of a longer story about how the world works — a story learned early, often in conditions where anger was the only power available.

The veil is also the energy itself. Anger feels alive in a way that many other states in this layer do not. It provides a sense of power, clarity, purpose. Releasing it can feel like releasing the only thing that's keeping you upright.`,

    dissolving: `Anger needs to complete its physical motion before it can transform. Suppressing it locks it in the body; expressing it destructively reinforces the neural patterns. The middle path: vigorous physical expression in a contained context. Running, lifting, martial arts, beating a pillow, screaming in a car. The body needs to discharge before the mind can examine.

After the discharge: curiosity about the story under the anger. What actually happened? What was the wound? What is the anger protecting? Often grief or fear is underneath — safer to access after the heat has moved.

The practice of distinguishing between anger as signal (something in this situation requires a response) and anger as noise (the chronic activation of an old pattern) develops over time. Both are real; they call for different responses.

Forgiveness — when it becomes genuine — is not forgetting or excusing. It is releasing the expectation that the past should have been different, and the ongoing project of punishing the one who made it that way. This doesn't happen on a schedule. It happens when it's ready.`,

    signs: `You notice the heat arising and can pause before acting from it. Not always — but sometimes, in situations where previously you would have responded without pause.

The anger completes more quickly and with less residue. You get angry, the anger moves, and it passes without the usual days of simmering.

You become aware of what's underneath a particular anger — the hurt, the fear, the grief — and can speak from that layer rather than from the hot surface.

The world begins to seem somewhat less antagonistic on average. Not naive — still capable of healthy boundary-setting — but not beginning from an assumption of hostility.`,
  },

  Pride: {
    experience: `Pride at this level is not self-respect or earned confidence — it is the defense against shame. It works by installing a sense of superiority: you are better, more discerning, more capable, more enlightened than others, and therefore the shame verdict doesn't apply to you. The self becomes elevated, and the elevation requires maintenance.

Scorn is its emotional signature: the contempt for those who do not meet the standard, who are beneath notice, who confirm by their inadequacy the value of your own positioning. From pride, the view of life is demanding — the world should meet your standards, and it frequently falls short.

Pride feels like confidence but has a fragility that genuine confidence lacks. It depends on constant comparative evaluation. When someone appears who exceeds your position, the whole structure is threatened, and anger or contempt is the defense.`,

    veil: `The veil of pride is its invisibility to itself. Shame, guilt, apathy — these are states that are recognizably painful and therefore more likely to be examined. Pride often presents itself as a solution rather than a problem. It feels like recovery rather than contraction. "I have overcome my shame" can be pride dressed in spiritual language.

The comparative structure is the core mechanism: your worth is established by being better-than. This means your sense of value depends on the continued presence of those who are lesser-than, and on the continued absence of those who would expose you as not quite good enough.

The deeper wound underneath pride is almost always shame. The elaborate superiority is built on top of the original verdict — it is the mind's creative attempt to escape a pain that has not actually been met and moved through.`,

    dissolving: `Pride dissolves through genuine humility — not performed modesty, but the actual recognition of limitation, fallibility, and dependence. This is uncomfortable precisely because it feels like returning to what pride was built to escape. The movement is: into the discomfort, not away from it.

Meeting your own ordinariness directly is the practice. Not ordinary as inadequate — ordinary as human, fallible, needing and needed, neither above nor below. When that ordinariness can be inhabited without shame, pride loses its function.

Connection across difference — with people the pride structure has marked as lesser — is particularly powerful. When you genuinely receive something from someone you had been diminishing, the hierarchy of worth becomes experientially questionable.

Therapy that reaches the shame underneath is usually necessary for durable change. The pride is the symptom; the shame is what's being treated.`,

    signs: `You notice the evaluative comparison running and can recognize it as a habit rather than an accurate assessment. "I'm better at this than they are" arises and you can watch it without fully believing it constitutes your value.

The need to be right begins to loosen. You can be wrong, publicly, without it threatening the whole structure of your self-regard.

Genuine curiosity about other people becomes available — not competitive curiosity, but the simpler interest in what someone's life has actually been like.

Moments of warmth for your own ordinariness. Your failures, limitations, and needs feel less like evidence of inadequacy and more like the normal conditions of being alive.`,
  },

  // ─── 4th Dimension ────────────────────────────────────────────────────────

  Courage: {
    experience: `Courage is the state where life becomes feasible despite its uncertainties. The fear hasn't disappeared — but it's no longer running the show. Something in you has decided, consciously or not, that the consequences of not living are worse than the risks of living. And so you move.

Affirmation is its emotional quality: a yes to what is, a yes to what's possible, a yes to yourself as someone capable of meeting what comes. It isn't confidence exactly — confidence implies knowing you'll succeed. Courage is more like: I don't know how this will go, and I'm going to engage with it anyway.

The view from here is feasible. Not wonderful, not certain, not guaranteed — feasible. The world has become something that can be met, navigated, participated in. That shift, after the terror of the lower layers, is enormous.`,

    veil: `The veil of courage is the residual reliance on individual effort as the primary mechanism. Courage is powerful, but it can harden into a certain kind of stoic self-sufficiency — "I can handle this alone" — that prevents the deeper relaxation into interdependence and ultimately into grace.

There is also a way in which courage can become its own identity. The brave one. The one who doesn't back down. That identity can make it difficult to acknowledge genuine limits, to ask for help, to allow others to carry some of what you've been carrying.

The invitation beneath courage is to discover that you don't have to earn your right to exist through constant effort and forward movement. The ground holds whether or not you're being brave.`,

    dissolving: `Practicing gratitude for what's already working — not as performance but as a genuine reorientation of attention from threat to what is actually present and functioning — gradually shifts the underlying assessment of the world from "something to survive" to "something to participate in."

Allowing support from others without it constituting failure. Courage practiced alone can become isolation. Practiced in community, it becomes something richer.

Honest self-examination: what am I being brave about that might actually benefit from surrender rather than persistence? Courage and wisdom need each other. Courage without wisdom produces exhausted heroism.

Beginning to act from values rather than from the need to prove something. The distinction is subtle but the energy is entirely different.`,

    signs: `You move toward difficult things without the usual period of paralysis. Not effortlessly, but more fluidly. The gap between deciding and doing narrows.

You acknowledge fear without it being a source of shame. "I'm scared about this" is sayable rather than something to conceal.

Other people's courage is inspiring rather than threatening. You can recognize bravery in others without it diminishing your own.

Brief moments where you sense you don't have to be brave right now — where something other than effort is sufficient. These feel unfamiliar and slightly suspicious, and they are exactly what comes next.`,
  },

  Neutrality: {
    experience: `Neutrality is the remarkable experience of things being okay without requiring them to be good. Not bliss, not happiness — a stable satisfaction with the fact of existence, a workability that doesn't depend on circumstances cooperating. Trust is its emotional quality: a basic sense that life can be navigated, that things will be manageable.

The view from neutrality is satisfactory. Not inspiring, not transcendent — satisfactory. That may sound modest, but from the vantage of the lower layers, where nothing was ever quite okay, satisfactory is a profound relief.

Here, you can disengage from conflicts without it feeling like defeat. You can remain stable in the presence of others' emotional turbulence without being destabilized. You have something like equanimity — not the deep equanimity of the higher layers, but a functional stability that allows for genuine effectiveness in the world.`,

    veil: `The veil of neutrality is the comfort of its stability. Things are working. There's no obvious motivation to examine what might be deeper. The suffering that drove the earlier seeking has eased, and with it, some of the urgency for further inquiry.

Neutrality can slide into detachment — a way of remaining unaffected by life's invitations by keeping everything at a slight distance. "I'm fine" can become a habitual response rather than an accurate report. The equanimity has not yet been tested by genuine depth.

The question neutrality cannot quite answer: Is this presence or distance? Am I actually here, or am I managing the experience of being here?`,

    dissolving: `Moving toward what genuinely matters, even when what you have is already working. The neutral zone is valuable as a stable base, not as a permanent residence.

Allowing yourself to be moved — to care about something enough to risk being affected by it. Neutrality that has become detachment is warmed by genuine engagement with what you love or what troubles you.

Discernment about the difference between non-attachment and numbness. One is free; the other is defended.

Beginning to notice the one who is remaining neutral. Who is the equanimous observer? The investigation of this question, held lightly, opens into what comes next.`,

    signs: `You notice genuine preferences without needing to act on all of them. The preference is clean — not compulsive, not threatening.

Situations that used to destabilize you don't anymore. You move through difficulty with an ease that surprises you sometimes.

You find yourself genuinely curious about something — not because it's useful or strategic, but because it interests you. Curiosity is a sign of growing aliveness.

The stability you have feels less like suppression and more like ground. Something is actually okay, not just managed into appearing that way.`,
  },

  Willingness: {
    experience: `Willingness is one of the most underrated states in the entire map — because it rarely gets dramatic attention, yet it is what makes nearly everything else possible. To be willing is to be open: to learning, to being wrong, to things unfolding differently than expected, to receiving help, to changing. That openness is not passive. It is an active orientation toward life that creates the conditions for actual growth.

Optimism is its emotional quality — not naive positive thinking, but a genuine assessment that things can work out, that effort is worth making, that the future is not simply the past repeated. The view of life is hopeful: genuinely, not performatively.

Something in willingness has released the grip on outcome. You're still oriented toward where you're going, but you've loosened the requirement that it go exactly as planned.`,

    veil: `The veil of willingness is the residue of willingness as a strategy — being open in order to get somewhere, being flexible in order to optimize, being willing as a technique for advancement. This is not quite the real thing.

True willingness has no agenda beneath it. But willingness-as-technique still has a controller running it: someone who has decided that being willing is the smart play. The willingness is real as behavior while remaining somewhat manufactured as orientation.

The question: willing toward what? If willingness is oriented entirely toward personal goals — even refined, spiritual personal goals — it remains in service of the project of self-completion. What opens beyond this layer is willingness without a destination.`,

    dissolving: `Acts of service — genuine giving without expectation of recognition or return — exercise a kind of willingness that the strategic self cannot manufacture. When you give and feel the freedom of it, something shifts.

Following genuine interest rather than strategic interest. What are you actually drawn to, when you set aside what you should be drawn to? Willingness in service of authentic engagement rather than optimal positioning.

Sitting with not-knowing. Choosing, in small moments, to not have an answer rather than generating one prematurely. Willingness extends naturally into the willingness to not-know.

The practice of receiving: letting others help, letting beauty land, letting love come in without deflecting it. Willingness has a receptive dimension that the doing-oriented self often resists.`,

    signs: `You try something you've always told yourself you can't do — not because you're now confident, but because you're willing to find out. The difference between those two motivations is significant.

You change your mind more easily. The updating of your views when new information arrives feels less like defeat and more like learning.

You find yourself saying "I don't know" with something like curiosity attached, rather than anxiety.

The quality of your yes changes — it becomes more genuine, less performed. When you agree to something, you actually mean it.`,
  },

  Acceptance: {
    experience: `Acceptance is the experience of what is, met without the constant requirement that it be different. Not resignation, not passivity — a profound engagement with reality as it actually is rather than as you require it to be. Forgiveness is its emotional signature, because acceptance must ultimately include the past: what happened, how it happened, who did what to whom.

The view of life from acceptance is harmonious. Not perfect — harmonious. Things fit together, even the difficult things, even the things that didn't go as hoped. There's a rightness that doesn't depend on everything being good.

The energy that was previously spent in resistance — in fighting what couldn't be changed, in requiring the past to have been different, in insisting that others become who you needed them to be — becomes available for something else. That energy release is one of acceptance's most practical gifts.`,

    veil: `The veil of acceptance is the difference between accepting what is and accepting defeat. The mind can confuse these, particularly in situations involving genuine injustice or harm. "Accept" can be misread as "approve" or "allow to continue." Genuine acceptance includes clear seeing of what is actually happening — and sometimes that clear seeing motivates decisive action.

There is also a subtler veil: acceptance as a spiritual achievement, held proudly, performed for self or others. "I've reached acceptance" as an attained position. Genuine acceptance is more modest than this — it doesn't make announcements.

The question that opens from here: who is accepting? The investigation of the accepter, rather than the further cultivation of accepting, is what opens the next layer.`,

    dissolving: `Forgiveness work — genuine, not premature. The kind that comes after fully acknowledging what actually happened, what was lost, what the cost was. Not "it's fine" but "it was not fine, and I'm not going to let it define the rest of my life."

Working directly with the places where acceptance doesn't come: the events still met with "it shouldn't have been this way." Each of those is a place where the mind is fighting the past. They can be examined one by one.

Paradoxically, surrender to what is makes possible a clearer response to what could change. The person in radical acceptance of a situation is often better positioned to act in it than the one who is fighting reality.

Meditation on impermanence helps. Whatever is causing suffering will change. Whatever you're holding onto will also change. That recognition, when it becomes visceral rather than conceptual, loosens the grip.`,

    signs: `You find yourself responding to difficult situations rather than reacting to them. The gap between stimulus and response has widened enough for choice to enter.

You notice you've stopped arguing with the past — not all the time, but in specific areas where the argument used to be constant. Something has been laid down.

Forgiveness arrives for something you thought you'd never forgive. Not because the wrongdoing became acceptable, but because you became too tired of carrying it.

A new quality in your relationships: you meet people more as they are, rather than as projects to change into who you need them to be.`,
  },

  // ─── New Humanity ─────────────────────────────────────────────────────────

  'Inner Light / Reason': {
    experience: `Inner Light is clarity that cares. It is the intellect turned toward what is actually true, not what is convenient or comforting, not what confirms what was already believed. Understanding is its emotional quality — not cold, not detached, but genuinely illuminated. When you touch something real, there is warmth in it.

From here, the view of life is meaningful. Not meaningful in the sense of having found a narrative that explains everything, but meaningful in the sense that inquiry itself feels worthwhile — that understanding matters, that truth can be pursued, that the mind is capable of genuine sight rather than only elaborate rationalization.

Reason at its deepest is not argument. It is the capacity to stay with a question until it yields, to follow thought wherever it leads even when that destination is inconvenient, to remain curious rather than shutting down inquiry when it becomes challenging.`,

    veil: `The veil of Inner Light is the love of understanding itself — the identity of the knower, the seeker, the one who has seen something others haven't. Knowledge can become the new currency in a more refined version of the pride structure. "I understand this" can be as defended as "I am better than you" — just harder to see.

The mind that must make meaning of everything is still a mind defending against emptiness. Reason becomes a veil when it is used to keep experience at a conceptual distance — understanding impermanence as a concept while avoiding the felt encounter with it.

There is also the trap of premature coherence: assembling everything into a system, satisfying the desire for complete understanding, and in doing so closing off the genuine inquiry that was beginning to open.`,

    dissolving: `Sitting with questions rather than answers. Deliberately dwelling in not-knowing for longer than is comfortable, resisting the move to resolve and conclude.

Reading widely in the contemplative traditions — not for information but for orientation. The reports of those who have gone further. The texts that have accompanied humans at the edges of what can be understood.

The practice of inquiry applied not to the world but to the inquirer: what is the one who is reasoning? Who is doing this understanding? These questions, turned back toward their source, begin to unsettle the knower identity in productive ways.

Silence. Periods of sustained silence in which the meaning-making apparatus is not being fed. This is experienced initially as deprivation and gradually as spaciousness.`,

    signs: `You find yourself comfortable with partial answers. The need for complete explanations has relaxed somewhat. Genuine "I don't know" has become available.

The quality of your listening changes — you hear what is being said rather than immediately preparing your response to it.

You notice when you're using understanding as a way to avoid feeling something. The gap between knowing about something and actually being with it becomes visible.

Moments of sudden clarity that are not the result of having argued your way somewhere, but of having gone quiet enough for something to become apparent.`,
  },

  'Inner Wisdom': {
    experience: `Inner Wisdom is knowing that doesn't arrive through argument or accumulation. It's more like recognition — the sense of something becoming clear that was somehow always known, beneath the layers of learning and opinion and strategy that overlay it. Reverence is its emotional quality: a quiet sense of the sacred in what is actually real.

The view of life from here is benign. Not merely workable, not merely meaningful — benign. The sense that existence itself is not hostile, not indifferent, but carries something like a benevolent intelligence that moves through things. This isn't naïve: suffering is still visible and real. But the deepest current of what is seems to be oriented toward something like flourishing.

Wisdom differs from intelligence in that it includes the knower in what is known. The wise perspective is not detached observation — it is a participation in reality that is itself transformed by the participation.`,

    veil: `The veil of Inner Wisdom is the sense of spiritual authority — the quiet self-assurance of someone who has genuine insight and knows it. This is subtler and harder to examine than the grosser forms of pride because it's often correct. The wisdom is real. The identification with being a wise person is the contraction.

The inner teacher can become the inner authority — an internalized hierarchy that replaces external authorities but maintains the same structure: there is a knower and there is what is known. That structure, however refined, still has a center that is protecting itself.

Wisdom also risks becoming conservative — the voice that says "I've seen through that" about things that might still have something to offer. The prejudice of the already-arrived.`,

    dissolving: `The teacher-student relationship — genuine surrender to someone who can show you something you cannot see yet. The willingness to be a student again, from a position of genuine knowledge, is one of the most powerful available movements at this level.

Sitting with what cannot be understood. Deliberately dwelling in mystery rather than explaining it. The parts of existence that remain genuinely opaque to reason are worth spending time with rather than converting into concepts.

Devotion, if that language resonates — the orientation of wisdom not toward its own authority but toward something larger. The wisdom in service of something it doesn't originate or control.

Ordinariness: the deliberate engagement with the most mundane aspects of life, without making them spiritual. The onion being cut. The floor being swept. Not as meditation techniques — as what they are.`,

    signs: `The advice you give others comes less from your knowledge and more from what the situation actually calls for. The wisdom is less about you and more about what is needed.

You find yourself uncertain about things you used to be confident about — not as regression, but as opening. The apparent regression into not-knowing is a deepening.

Your compassion has become less effortful. You don't have to remind yourself to be compassionate — something responds that way naturally, before the thought.

The silence between words has become as meaningful as the words. You're in no hurry to fill it.`,
  },

  'Inner Love': {
    experience: `Inner Love is not emotion in the ordinary sense. It doesn't arise in response to particular people or circumstances — it is more like the quality of attention itself when attention has become sufficiently clear. A recognition: something in you meets something in the other that is the same thing. Not the personalities, not the histories, not the roles — something more fundamental, and that meeting is love.

Reverence is its emotional quality — a deep and quiet regard for existence that doesn't require an object to direct it toward. You might walk through an ordinary day and find this quality present — in the face of a stranger on the subway, in the light on a wall, in a bird landing on a branch. Nothing special is required. The specialness is in the attention.

The view of life from here is benign and sacred. Things carry a significance that doesn't need explanation. You are not deciding to love — you are recognizing what was always here, beneath the conditions and requirements that love previously carried.`,

    veil: `The veil is the last trace of a lover — someone who is having the experience of love, someone whose love is directed toward. However sublime the love is, as long as there is a one who loves and another who is loved, the subject-object structure remains. The love is real; the structure around it is the very last veil.

There is also a subtle clinging to the experience of love itself — the quality is so fine that any deviation from it is registered as loss, and seeking to restore it begins. This seeking, however gentle, is still a form of grasping.

The invitation is toward love that doesn't require an experiencer. Not the love of someone loving something, but love itself, groundlessly present, prior to the distinction.`,

    dissolving: `Removing conditions from your love, one by one. Not as a practice of self-improvement — as an examination: what would remain if I released the requirement that this person (or situation, or feeling) be a certain way? What is here when the condition is absent?

Allowing love to include the difficult. The things you have walled off from your love — the people you have judged, the parts of yourself you have rejected — are the exact places where the next opening is available.

Prayer or contemplation oriented toward love not as feeling but as reality. Not "I want to feel loving" but "what is the nature of this?"

Simply being with another person, fully, without agenda. Letting them be exactly what they are, with your full attention. The simplest practice and one of the most demanding.`,

    signs: `You love people you don't particularly like. The affection is not dependent on approval of the personality.

The quality of your attention in conversation changes — you are genuinely present to what the other person is saying and experiencing, not waiting for your turn.

Moments where the distinction between self and other becomes unclear — not in a frightening or dissociative way, but in a warm and spacious way. The boundary is permeable rather than fixed.

You find that you can receive love as well as give it — that the walls on the receiving side have softened as much as those on the giving side.`,
  },

  // ─── 5th Dimension ────────────────────────────────────────────────────────

  'Oneness / Joy': {
    experience: `Oneness is the collapse of the absolute sense of separation. Not the philosophical position that everything is connected — the direct experience in which the clear demarcation between "I" and "not-I" becomes permeable, then translucent, then sometimes barely there at all. You are still you — the body, the name, the specific view — but these feel more like the form that awareness takes in this location than like a fixed container that awareness lives inside.

Serenity is its emotional quality: a settledness that can hold everything, that is not disturbed by the arising of what is difficult because it is deeper than what arises. Joy appears without occasion — the sheer fact of existence is enough to generate it. A bird, a phrase, the warmth of a hand — these are occasions for joy to arise, not causes of it. The joy was already there; the ordinary moment is simply what removes the temporary covering.

Life looks complete from here. Not finished — complete. As it is, with everything that belongs to it, including what is still unresolved.`,

    veil: `The veil is the remaining sense of a witness — the one experiencing unity. However direct the experience of oneness is, if there is still a someone to whom it is happening, the final structure has not dissolved. The witness is the last contraction.

There can also be attachment to the state itself — the serenity is so beautiful that the approach of more ordinary consciousness feels like loss, and reaching to restore the serenity is the beginning of suffering.

The spiritual identity of "someone who has touched oneness" — however quietly held — is still a position, and positions are held by someone. That someone is the contraction.`,

    dissolving: `Non-directive meditation: simply sitting, without technique, without agenda, without trying to reproduce or maintain any state. The very trying is what creates the distance. Allowing what is here to be here, completely.

In ordinary life: moments of full attention to what is actually happening. Not mindfulness as a practice, but as what it is — the simple act of being present to the specific reality of this moment, which is always sufficient.

Noticing the moments when the witness is not prominent — when you're deeply engaged in something, or in states of natural beauty, or in creative absorption — and recognizing what those states have in common. That recognition itself is a form of rest in what you are.`,

    signs: `Joy appears without needing anything to justify it. Small things are enough — genuinely, not as a practiced attitude.

The sense of separation, while still present in ordinary functioning, has lost its absolute quality. You can question it as an assumption rather than simply living inside it.

You are less disturbed by disturbance. The equanimity is not the absence of feeling but the presence of something underneath feeling that remains stable.

Compassion for others has become less effortful and more spontaneous. You find yourself moved by the simple human fact of people without needing to process or decide to be moved.`,
  },

  'Presence / Peace': {
    experience: `Peace at this depth is not a state that arrives when problems are solved — it is the ground underneath every state. The sky, not the weather. When you are in genuine contact with it, you recognize that it was never absent — only temporarily covered by the weight of what you were convinced was more real.

Bliss is its emotional quality — not the bliss of pleasure or achievement, not the relief of suffering ending, but a quality intrinsic to awareness itself. Awareness, met directly, is blissful. This sounds mystical; it is actually ordinary. It is what remains when the demand that experience be different has gone quiet.

The view of life from here is perfect. Not perfect in the sense that everything is arranged correctly — perfect in the sense that everything that is here belongs here. Everything that has happened was necessary. This recognition does not require agreement with everything that has happened. It is a much deeper acceptance than that.`,

    veil: `The veil is the subtlest remaining sense that this peace is something you are having rather than something you are. The witness — the most refined, transparent version of a self — still separates the one at peace from the peace itself.

There may also be what could be called spiritual satiation: the peace is so complete that no further inquiry seems necessary. The satisfaction is genuine, but it can function as a resting place before the final dissolution.

Bliss, like all states, arises and passes. The identification with being-someone-who-abides-in-bliss is still identification, and identification always carries the seed of suffering.`,

    dissolving: `The specific invitation of this layer is allowing — the most radical doing-nothing available. Not effortful surrender, not practiced equanimity, but a complete release of the project of achieving any particular state, including this one.

The practice, if it can be called that: simply be what you are. Without modification, without improvement, without getting anywhere. The moment you try to get to peace, you've left it. The moment you stop trying, you're already there.

Spending time in genuine stillness — not stillness as achievement, but the natural quiet that is available when the mind's agenda has temporarily been set down. Let the agenda return; set it down again; return. This is not failure. It is the practice.`,

    signs: `You are increasingly unable to locate the beginning of peace. It seems to have been here. The discovery is not of peace — it is that peace was never absent, only unrecognized.

Very little is required for the day to feel complete. The requirements for okayness have become minimal.

The things that used to disturb you still arise, but they no longer disturb the peace the same way a wave disturbs the ocean. The wave is real; the ocean is unmoved.

You find that you are not working toward anything anymore. You are simply living. And that is enough — genuinely, not as a practice of acceptance.`,
  },

  // ─── I AM Presence ────────────────────────────────────────────────────────

  'Non-Duality': {
    experience: `Non-duality is the direct recognition that the subject-object split — the foundational structure of ordinary experience — is not ultimately real. There is experiencing; there is no separate experiencer. There is awareness; there is no container that awareness belongs to. What you always took to be a self, a center from which experience was processed, has been revealed as a kind of optical illusion: a pattern that awareness generates, mistaken for its source.

The emotional quality is ineffable — not because the state is negative or neutral, but because the categories available for description were all built on the subject-object structure that has collapsed. Words like "joy" and "peace" still apply, but they apply in a modified way: not emotions experienced by a subject, but qualities intrinsic to awareness itself.

Non-duality is not a blank. The world remains vivid, detailed, present. People are still people. Trees are still trees. But the sense that you are in here and the world is out there — that absolute division — has become transparent.`,

    veil: `There is a recognition that "I have arrived at non-duality" — and that recognition, however accurately it reports a genuine experience, still requires a recognizer. The last veil is the one doing the recognizing.

Language itself becomes a veil at this layer: every word creates a slight object, and stringing words together creates a slight knower-and-known. This text is a veil. Awareness of the veil does not remove it.

What remains, if anything: the faintest sense of being a witness — awareness aware of itself, not from complete indistinction but with a barely perceptible sense of self-reflection. This is the ghost of the subject, so thin it barely casts a shadow.`,

    dissolving: `Self-inquiry turned back on the inquirer — not as technique but as genuine question. Who is aware? What knows? Following that question, not to a conceptual answer, but to its source in direct experience. The question dissolves in its answer; the answer is not a thing.

The natural awareness practice: not trying to manufacture any state, but recognizing the awareness that is already here — the one that has been here through every state you've ever been in. That awareness has never left. You have always been it, even while identifying with temporary content.

Resting without agenda. The most complete instruction available at this layer. There is nowhere to go. You are already what you are looking for.`,

    signs: `Ordinary experience is the same and utterly different. Nothing has changed in the outer content of life; the inner quality of meeting it is entirely different.

The question "who am I?" generates not anxiety but something like laughter or warmth. The answer is so obvious and so impossible to say.

Thoughts arise and are recognized as arising, without full capture. There is thinking, but less and less is there a thinker.

The silence between moments has become very loud.`,
  },

  Awareness: {
    experience: `Awareness is what remains when everything that can be observed has been noticed as not being the observer. The body: observable, therefore not the ultimate self. The thoughts: observable, therefore not the observer. The emotions: observable. The sense of being a person: observable. All of it contents of awareness — and awareness itself is what is looking.

Ineffable is the word, because every word points at something within awareness, not at awareness itself. Awareness is the condition for any description, not a thing that can be described. When you look directly at the looking, there is no object — just the looking itself. That is what you are.

The view of life from here is simply: Is. Not good or bad, meaningful or meaningless, threatening or safe. Just Is. The quality of that Is is not flat — it is luminous, alive, full. But it doesn't require characterization. It is enough to be what is, without requiring it to be anything particular.`,

    veil: `The final paradox: the veil at this layer is awareness itself, knowing itself. There is a faint reflexive quality — awareness catching its own movement, the eye trying to see itself seeing. This is not a problem. It may not even be a veil in the usual sense. But if anything remains between this and what the next layer points toward, it is this: the barely perceptible distinction between awareness and its self-recognition.

Efforts to dissolve this remaining trace will thicken it. The eye trying harder to see itself sees only a kind of blur. The only movement available here is not a movement: a complete settling into what is, without even the project of settling.

Trying to understand this is the veil. Not understanding it is the opening.`,

    dissolving: `There is nothing to dissolve and no one to dissolve it. This is not resignation — it is the most precise description available. The one who was doing the dissolving has become too transparent to sustain the project.

What remains: simply being what you are. Not as practice. As recognition. You already are this. The only thing that has ever been in the way is the search for it.

If a pointer is useful: rest in the one that has never been disturbed by anything that has ever happened. Not the feeling of peace — the one who is aware of both peace and disturbance. That one has always been undisturbed. Find it by stopping the search for it.`,

    signs: `The search has stopped — not because you gave up, but because you noticed you were already standing in what you were looking for.

Everything is completely ordinary and something has fundamentally changed. You cannot locate the change.

The question "am I aware?" is almost funny. Of course. Always. It could not be otherwise.

Nothing is required. Nothing is missing. This, exactly as it is.`,
  },

  // ─── Enlightenment ────────────────────────────────────────────────────────

  'The Great Void': {
    experience: `The Great Void is not absence. The deepest mistake is to approach it through the idea of emptiness as lack. The Void is the fullness from which all form arises — not empty but prior to content, not silent but prior to sound, not dark but prior to light. When anything is met without the overlay of interpretation, what remains is this: a pregnant, luminous, dimensionless presence that has always been the ground of everything.

Language has nothing adequate to say here. Every sentence that begins "The Void is..." contradicts itself by making an object of what cannot be an object. "Ineffable" is accurate: it literally cannot be uttered. Not because it is absent, but because every utterance moves away from it.

The view of life from the Void is simply: Is. Not assessed, not evaluated. The Is-ness of things. That the chair is. That awareness is. That this moment is. Without reaching for what it means or what comes next.`,

    veil: `The only veil is the one that says there is a veil. The one looking for the Great Void, trying to enter it, wanting to experience it — that one is the contraction, and it cannot dissolve itself through its own efforts. Every effort to reach the Void moves away from it; the Void is not reached, only recognized where it always already is.

There may be a faint attachment to the state itself — the Void is so complete, so restful, that even resting here carries the seed of preference for remaining. That preference, however fine, is a trace of grasping. And grasping and the Void cannot occupy the same space.`,

    dissolving: `Nothing dissolves here. Dissolution, as a project undertaken by someone, has exhausted itself. What occurs at this depth occurs by grace — not a grace sent from elsewhere, but the natural resolution of the seeking project when it has fully spent itself.

If there is any pointing possible: the Void is here, in this exact moment, beneath the reading of these words. Not after the reading, not in a different state — here. The search for it is the only thing preventing the recognition of its constant presence.

Stop explaining it to yourself. You already know what this is.`,

    signs: `There are no signs that apply in the ordinary sense. The one who would collect and evaluate signs has become too transparent for that function.

Peace beyond understanding. Not the peace of understanding — peace that was here before any understanding was possible, and will be here after understanding is no longer needed.

Everything continues. The ordinary life proceeds with complete fidelity to its ordinariness. And nothing is the same.`,
  },

  'Divine Grace & Love': {
    experience: `Divine Grace is not something given from elsewhere. It is the felt quality of existence itself when existence is met without the overlay of fear, demand, or interpretation. The warmth that is always present beneath every contraction. Not love directed toward you — love as the nature of what is, prior to the division between lover and loved.

To touch this is to recognize that what was being sought through every earlier movement — every therapy session, every meditation retreat, every act of courage, every moment of genuine connection — was pointing toward this. Not as a reward at the end of a journey, but as the nature of the journey's ground. It was here at the beginning. It was here in the middle. It is here at what appears to be the end.

The view from here is simply Is — and that Is is somehow, impossibly, exactly enough.`,

    veil: `The most precise thing that can be said: even the recognition of Divine Grace as such — the naming, the knowing that this is grace — creates a slight distance from grace itself. The most complete grace is not recognized as grace; it is simply what is.

This is not a criticism of recognition. Recognition is what brings humans to this threshold. But the final movement, if there is one, is from recognition of grace to being grace — from the one experiencing the sacred to the sacred itself, prior to the experience.

There is no technique for this. Techniques are for someone. What's here requires no one.`,

    dissolving: `You cannot dissolve into grace. You can stop pretending you are separate from it. The difference between those two sentences is everything.

The only instruction: be here, without requiring anything of here. Without needing it to confirm anything, to go anywhere, to be more than it is. When the requirement stops, what remains is grace.

Surrender — not as an act of will but as the natural completion of a long project of trying. The trying, when fully exhausted, opens into this. And "this" was always already here.`,

    signs: `The world is luminous. Not metaphorically. Actually suffused with something that has no adequate name and doesn't require one.

You are moved, frequently, by ordinary things. Not because something special has happened — because you are here for them.

The love you feel doesn't require an object. It is simply present — ambient, like warmth from a sun that is too close to cast a shadow.

Nothing is missing. This is not a conclusion you've reached. It is a recognition that has always been available, now impossible to unsee.`,
  },

  // ─── 12th Dimension ───────────────────────────────────────────────────────

  'Supra-Causal Truth': {
    experience: `Supra-Causal Truth points to what is prior to the chain of cause and effect — prior to the first arising, prior to the mechanism of becoming. Not a state that follows other states. The ground itself, which does not depend on anything else for its existence because it is existence. Not a kind of existence, or a quality of existence — existence as such.

To experience Supra-Causal Truth is not to have an experience. It is the recognition of what is always here before any experience begins — the unchanging basis in which all states, all experiences, all knowings, arise and dissolve. The truth that was never not true. The presence that was never not present.

Words like "experience" and "recognition" are not quite right — they still imply a subject who experiences or recognizes. At this depth, those distinctions have become too fine to maintain. What is here is prior to the one who knows it.`,

    veil: `There is no veil. The recognition that there is no veil is itself the last trace of a recognizer. At this threshold, even that dissolves — not by action, but by grace, when the time is complete.

Language can only point toward the door. What is beyond the door cannot be described, because description happens on this side. The pointing is useful. The map is not the territory. At this depth, map and territory are not two things.`,

    dissolving: `There is nothing to dissolve and no one to dissolve it. The one who was seeking Supra-Causal Truth was always already it, looking for itself in mirrors. When the mirrors become transparent, what remains is what was always looking.

The only pointer available: rest in what is here before the first movement of the mind. Before the first thought. Before the first intention. That stillness is not empty. It is full of what you are.`,

    signs: `There are no signs. There is no one to notice them. There is what is. That is all. And that is enough.`,
  },

  'Full Consciousness': {
    experience: `Full Consciousness is not knowing everything. It is the complete absence of anything obscuring the nature of what you are. Every layer dissolved — not discarded, not transcended, but seen through: transparent to the light that was always shining behind them. What remains is not a state of attainment. It is the recognition of what was here before the first layer appeared.

Material desires do not disappear through discipline or suppression. They simply become irrelevant — the way a locked door becomes irrelevant when you realize you were never inside the room. Purpose arises of itself, the way light from a lamp doesn't need to decide to illuminate.

This is not a destination. It is the recognition that the journey was always happening within what you already are. The center doesn't feel like a reward. It feels like coming home to something you never actually left.`,

    veil: `There is no veil at Full Consciousness. The veil was never real — and the recognition of this is the final movement of dissolution. Not a veil removed, but the discovery that what appeared to be a veil was the light itself, seen at too close a distance to recognize.

To describe the veil of Full Consciousness is to speak from a position where opacity is still possible. That position is not available here. These words themselves are the last gesture of the map, acknowledging that the territory was always already present.`,

    dissolving: `There is nothing to dissolve and no one to dissolve it. This is the most precise statement available. The project of becoming fully conscious has revealed that full consciousness was never lost. The seeker and the sought were never two.

You are That, encountering itself in the form of a person reading words on a screen. The reading itself is the recognition. There is nowhere to go.`,

    signs: `There are no signs. There is no checklist. The one who would check has become too transparent to perform the function.

What remains: this. Exactly this. The simple suchness of whatever is here. And the quiet knowing — not thought, not earned, not achieved — that this was always what everything was pointing toward.

The journey is complete. The journey never began. Both of these are true.`,
  },
};
