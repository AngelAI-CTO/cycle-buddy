from datetime import date, timedelta
from enum import Enum


class CyclePhase(str, Enum):
    MENSTRUATION = "menstruation"
    FOLLICULAR = "follicular"
    OVULATION = "ovulation"
    LUTEAL = "luteal"
    PMS = "pms"


PHASE_INFO = {
    CyclePhase.MENSTRUATION: {
        "name": "Менструация",
        "emoji": "🔴",
        "mood": "Она как медведь после зимней спячки — не буди зверя",
        "energy": "low",
        "tips": [
            "Грелка, плед, чай — святая троица выживания. Принеси все три и молча уйди",
            "Шоколад сейчас ценнее бриллиантов. Серьёзно. Запасись заранее",
            "Она плачет от рекламы с котёнком? Это нормально. Плачь вместе, если надо",
            "Посуда в раковине? Бро, ты знаешь что делать. Молча. Без ожидания медали",
            "Предложи сериал. Любой. Даже тот ужасный, который она любит. Это жертва, на которую ты способен",
            "Если она говорит 'всё нормально' — всё НЕ нормально. Неси шоколад",
        ],
        "avoid": [
            "'Ты что, на месячных?' — фраза, после которой тебя могут не найти",
            "Комментарии о еде и весе = билет в один конец на диван",
            "Серьёзные разговоры отложи. Совсем. На потом. Серьёзно",
            "Не предлагай 'пойти побегать, чтобы полегчало'. Просто не надо",
        ],
    },
    CyclePhase.FOLLICULAR: {
        "name": "Фолликулярная фаза",
        "emoji": "🌱",
        "mood": "Она как после перезагрузки — всё работает, баги пофикшены",
        "energy": "rising",
        "tips": [
            "Она в хорошем настроении. Не знаешь почему — не спрашивай. Просто наслаждайся",
            "Самое время предложить то, на что она обычно говорит 'нет'. Шансы растут!",
            "Хочешь обсудить что-то важное? Сейчас или никогда. Буквально — через неделю будет поздно",
            "Она энергичная и весёлая. Матч по энергии — предложи свидание, прогулку, приключение",
            "Это как 'счастливый час' — но вместо скидок у тебя скидка на косяки. Пользуйся",
        ],
        "avoid": [
            "Не сиди в телефоне, когда она хочет общаться. Эти дни на вес золота, бро",
            "Не трать это окно на очередной вечер с PlayStation. Она же улыбается!",
        ],
    },
    CyclePhase.OVULATION: {
        "name": "Овуляция",
        "emoji": "🌸",
        "mood": "Максимальная привлекательность и уверенность. Она — огонь, а ты — мотылёк",
        "energy": "peak",
        "tips": [
            "Она выглядит и чувствует себя богиней. Скажи ей об этом. Вслух. Словами",
            "Комплименты сейчас заходят как кэшбэк 100% — вкладывай не жалея",
            "Планируй свидание мечты. Она скажет 'да' на всё. Ну, почти на всё",
            "Она общительная и сияет? Другие мужики тоже это заметят. Будь рядом, ковбой",
            "Романтика на максимум. Свечи, ужин, слова. Да, придётся постараться",
        ],
        "avoid": [
            "Не будь мебелью. Она хочет внимания, а не сожителя с Wi-Fi",
            "Не ревнуй к каждому, кто на неё посмотрел. Она с тобой. Пока что",
        ],
    },
    CyclePhase.LUTEAL: {
        "name": "Лютеиновая фаза",
        "emoji": "🍂",
        "mood": "Батарейка садится. Она как телефон на 15% — экономь её ресурсы",
        "energy": "declining",
        "tips": [
            "Уютный вечер дома > любой вечеринки. Плед, фильм, обнимашки — идеальный набор",
            "Она задумчивая? Не спрашивай 'О чём думаешь?' сто раз. Дай побыть в себе",
            "Приготовь что-нибудь вкусное. Путь к прощению любых грехов лежит через желудок",
            "Настроение скачет как курс биткоина. Не пытайся предсказать — просто держись",
            "Она захочет пересмотреть ваши отношения? Это не всерьёз. Просто кивай и обнимай",
        ],
        "avoid": [
            "Не планируй марафон, горный поход и встречу с друзьями в один день",
            "Не спрашивай 'А что на ужин?' — лучше сам свари хотя бы пельмени",
            "Не спорь по мелочам. Носки на полу — ерунда. Подними и живи дальше",
        ],
    },
    CyclePhase.PMS: {
        "name": "ПМС",
        "emoji": "⚡",
        "mood": "Сегодня ты будешь виноват во всём. Во всех проблемах мира. Просто прими это",
        "energy": "low",
        "tips": [
            "Ты не прав. Даже если прав — ты не прав. Запомни это на ближайшие дни",
            "Она плачет? Обними. Она злится? Обними. Она швыряет подушку? Уклонись, потом обними",
            "Принеси еду, не спрашивая. Угадай что она хочет. Не угадал? Принеси ещё",
            "Фраза 'может тебе прилечь?' может стоить тебе жизни. Замени на 'хочешь, я сделаю чай?'",
            "Её бесит как ты дышишь? Поздравляю, ты нормальный мужик в фазе ПМС",
            "Помой посуду, пропылесось, погуляй с собакой. Не жди спасибо. Ты герой без плаща",
            "Дай ей пространство, если просит. Но будь рядом, если не просит. Да, это квест",
        ],
        "avoid": [
            "'Это у тебя ПМС' = последние слова в жизни многих смелых мужчин",
            "'Успокойся' — слово-триггер. Произнесёшь — не вернёшься",
            "Шутки про гормоны = спать на диване. Минимум. Если повезёт",
            "Не пытайся 'починить' её настроение логикой. Логика тут не живёт",
            "Не обесценивай чувства. 'Да ладно, ерунда' = взрыв атомной бомбы",
            "'У моей мамы такого не было' — ты ведь не настолько глуп, правда?",
        ],
    },
}


def calculate_current_phase(
    last_period_start: date,
    cycle_length: int = 28,
    period_length: int = 5,
    target_date: date | None = None,
) -> dict:
    """Calculate the current cycle phase based on last period start date."""
    today = target_date or date.today()

    days_since_start = (today - last_period_start).days

    # Normalize to current cycle
    day_in_cycle = days_since_start % cycle_length
    if day_in_cycle < 0:
        day_in_cycle += cycle_length

    current_cycle_start = last_period_start + timedelta(
        days=(days_since_start // cycle_length) * cycle_length
    )

    # Determine phase
    ovulation_day = cycle_length - 14  # ovulation ~14 days before next period
    pms_start = cycle_length - 5       # PMS ~5 days before next period

    if day_in_cycle < period_length:
        phase = CyclePhase.MENSTRUATION
        days_left = period_length - day_in_cycle
    elif day_in_cycle < ovulation_day - 2:
        phase = CyclePhase.FOLLICULAR
        days_left = (ovulation_day - 2) - day_in_cycle
    elif day_in_cycle < ovulation_day + 2:
        phase = CyclePhase.OVULATION
        days_left = (ovulation_day + 2) - day_in_cycle
    elif day_in_cycle < pms_start:
        phase = CyclePhase.LUTEAL
        days_left = pms_start - day_in_cycle
    else:
        phase = CyclePhase.PMS
        days_left = cycle_length - day_in_cycle

    # Next period prediction
    next_period_start = current_cycle_start + timedelta(days=cycle_length)
    days_until_next_period = (next_period_start - today).days

    phase_info = PHASE_INFO[phase]

    return {
        "phase": phase.value,
        "phase_name": phase_info["name"],
        "emoji": phase_info["emoji"],
        "day_in_cycle": day_in_cycle + 1,  # 1-indexed for display
        "cycle_length": cycle_length,
        "days_left_in_phase": days_left,
        "days_until_next_period": days_until_next_period,
        "next_period_date": next_period_start.isoformat(),
        "mood": phase_info["mood"],
        "energy": phase_info["energy"],
        "tips": phase_info["tips"],
        "avoid": phase_info["avoid"],
    }


def get_forecast(
    last_period_start: date,
    cycle_length: int = 28,
    period_length: int = 5,
    days_ahead: int = 14,
) -> list[dict]:
    """Get a forecast for the next N days."""
    today = date.today()
    forecast = []
    for i in range(days_ahead):
        target = today + timedelta(days=i)
        info = calculate_current_phase(
            last_period_start, cycle_length, period_length, target
        )
        forecast.append({
            "date": target.isoformat(),
            "day_of_week": target.strftime("%A"),
            "phase": info["phase"],
            "phase_name": info["phase_name"],
            "emoji": info["emoji"],
            "mood": info["mood"],
            "energy": info["energy"],
        })
    return forecast
