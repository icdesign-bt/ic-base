#!/usr/bin/env python3
"""Заполнить docs/pitch/БЗ-2.0-пре-скрининг.pptx: только 3 слайда до пре-скрининга."""

from __future__ import annotations

from pathlib import Path

from pptx import Presentation
from pptx.dml.color import RGBColor
from pptx.oxml.ns import qn
from pptx.util import Pt

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "docs/pitch/БЗ-2.0-пре-скрининг.pptx"
BACKUP = ROOT / "docs/pitch/БЗ-2.0-пре-скрининг.шаблон-копия.pptx"
SRC = OUT

DARK = RGBColor(0x11, 0x13, 0x18)


def set_shape_text(shape, text: str, *, color: RGBColor | None = None) -> None:
    tf = shape.text_frame
    first_run = None
    for p in tf.paragraphs:
        for r in p.runs:
            first_run = r
            break
        if first_run:
            break

    for p in list(tf.paragraphs)[1:]:
        p._p.getparent().remove(p._p)

    p0 = tf.paragraphs[0]
    for r in list(p0.runs):
        r._r.getparent().remove(r._r)

    lines = text.split("\n")
    run = p0.add_run()
    run.text = lines[0]
    if first_run is not None:
        run.font.size = first_run.font.size
        run.font.bold = first_run.font.bold
        run.font.name = first_run.font.name
    if color is not None:
        run.font.color.rgb = color

    for line in lines[1:]:
        p = tf.add_paragraph()
        try:
            p.alignment = p0.alignment
        except Exception:
            pass
        r = p.add_run()
        r.text = line
        if first_run is not None:
            r.font.size = first_run.font.size
            r.font.bold = first_run.font.bold
            r.font.name = first_run.font.name
        if color is not None:
            r.font.color.rgb = color


def clear_fill(shape) -> None:
    try:
        shape.fill.background()
    except Exception:
        pass


def shape_by_id(slide, shape_id: int):
    for sh in slide.shapes:
        if sh.shape_id == shape_id:
            return sh
    raise KeyError(f"shape_id {shape_id} not found")


def delete_slide(prs: Presentation, index: int) -> None:
    slide_id = prs.slides._sldIdLst[index]
    rId = slide_id.get(qn("r:id"))
    prs.part.drop_rel(rId)
    prs.slides._sldIdLst.remove(slide_id)


def main() -> None:
    if not BACKUP.exists():
        BACKUP.write_bytes(SRC.read_bytes())
    prs = Presentation(str(BACKUP))

    # Indices in template: 0 instruction, 1 cover, 2 problem, 3 solution, 4+ drop

    # --- 1. Cover ---
    s = prs.slides[1]
    set_shape_text(
        shape_by_id(s, 23),
        "База знаний 2.0\nЕдиный источник знаний ИЦ: файлы, смысл, чат и встречи",
        color=DARK,
    )
    clear_fill(shape_by_id(s, 23))
    set_shape_text(
        shape_by_id(s, 12),
        "Для сотрудников ИЦ — находить актуальную версию и смысл из документов и встреч в одном месте",
        color=DARK,
    )
    clear_fill(shape_by_id(s, 12))
    set_shape_text(
        shape_by_id(s, 19),
        "Курылев Константин · продуктовый дизайн · Управление дизайна",
        color=DARK,
    )
    clear_fill(shape_by_id(s, 19))
    set_shape_text(shape_by_id(s, 15), "Пре-скрининг · нояб. 2026", color=DARK)
    clear_fill(shape_by_id(s, 15))
    set_shape_text(
        shape_by_id(s, 16),
        "Пилот: «нашёл с первого раза» на корпусе Инновационной столицы + сценарий доступов",
        color=DARK,
    )
    clear_fill(shape_by_id(s, 16))

    # --- 2. Problem ---
    s = prs.slides[2]
    set_shape_text(
        shape_by_id(s, 72),
        "Сложно быстро найти актуальную версию: много файлов, поиск по именам и папкам, знание уезжает в личные чаты",
        color=DARK,
    )
    clear_fill(shape_by_id(s, 72))
    set_shape_text(
        shape_by_id(s, 64),
        "Нужен документ или ответ по проекту / инициативе",
        color=DARK,
    )
    clear_fill(shape_by_id(s, 64))
    set_shape_text(
        shape_by_id(s, 65),
        "Ищет в icknowledge по папкам и названиям, скачивает пачку «на всякий случай», доспрашивает коллег в личных чатах",
        color=DARK,
    )
    clear_fill(shape_by_id(s, 65))
    set_shape_text(
        shape_by_id(s, 66),
        "В текущей Базе знаний (icknowledge) и в личных чатах",
        color=DARK,
    )
    clear_fill(shape_by_id(s, 66))
    set_shape_text(
        shape_by_id(s, 67),
        "Почему сейчас\nБазу знаний нужно развивать; ОС Стратегии: поиск по содержимому и предпросмотр — главная боль",
        color=DARK,
    )
    clear_fill(shape_by_id(s, 67))
    set_shape_text(
        shape_by_id(s, 68),
        "Последствия\nПотеря времени, копии в чатах, риск устаревшей версии, скачивания «вслепую» без предпросмотра",
        color=DARK,
    )
    clear_fill(shape_by_id(s, 68))
    set_shape_text(
        shape_by_id(s, 71),
        "Масштаб: десятки тысяч файлов, сотни сотрудников. Оценка пользователей — «скачиваю десяток», повторный обход папок (ОС Стратегия, нояб. 2026). Гипотеза: сократить шаги до нужного файла ≥2× на целевых сценариях",
        color=DARK,
    )
    clear_fill(shape_by_id(s, 71))
    set_shape_text(
        shape_by_id(s, 73),
        "Как обходят сейчас: папки в icknowledge → скачать пачку → открыть локально; пересылка файлов и ответов в личных чатах. Цикл повторяется при каждом новом запросе",
        color=DARK,
    )
    clear_fill(shape_by_id(s, 73))

    # --- 3. Solution ---
    s = prs.slides[3]
    set_shape_text(
        shape_by_id(s, 72),
        "Обновить Базу знаний: поиск по смыслу, предпросмотр, ИИ-чат с цитатами и знания из встреч — в одном месте",
        color=DARK,
    )
    clear_fill(shape_by_id(s, 72))
    set_shape_text(
        shape_by_id(s, 7),
        "Для сотрудников ИЦ (фокус Аппарат / Стратегия / HR / продакты): один вход вместо обхода папок и личных чатов",
        color=DARK,
    )
    clear_fill(shape_by_id(s, 7))
    set_shape_text(
        shape_by_id(s, 33),
        "Задаёт вопрос по смыслу или в чате; смотрит предпросмотр; открывает знание из встречи",
        color=DARK,
    )
    clear_fill(shape_by_id(s, 33))
    set_shape_text(
        shape_by_id(s, 34),
        "Ищет по смыслу с учётом доступов; отвечает с цитатами из документов; сохраняет итог встречи как находимую карточку",
        color=DARK,
    )
    clear_fill(shape_by_id(s, 34))
    set_shape_text(
        shape_by_id(s, 35),
        "Нашёл нужное с первого раза; видит только доступное; понял файл без лишнего скачивания",
        color=DARK,
    )
    clear_fill(shape_by_id(s, 35))
    set_shape_text(
        shape_by_id(s, 37),
        "As is: icknowledge — хранение и поиск по именам/папкам; ответы и копии файлов — в личных чатах. Этого мало для «нашёл с первого раза»",
        color=DARK,
    )
    clear_fill(shape_by_id(s, 37))
    set_shape_text(
        shape_by_id(s, 41),
        "Опереться: текущая База знаний как оболочка; уже существующие наработки по умному поиску, чату и транскрибации — встраиваем в БЗ, не забираем как отдельные продукты",
        color=DARK,
    )
    clear_fill(shape_by_id(s, 41))
    set_shape_text(
        shape_by_id(s, 44),
        "Отличие в пилоте: разные формулировки → одна выдача; предпросмотр до скачивания; доступы меняют выдачу и ответы чата",
        color=DARK,
    )
    clear_fill(shape_by_id(s, 44))
    set_shape_text(
        shape_by_id(s, 47),
        "Не обещаем сейчас: прод-LLM и индексацию «как есть», админку прав/SSO, полную замену icknowledge, оценку инфраструктуры",
        color=DARK,
    )
    clear_fill(shape_by_id(s, 47))

    # Оставить только cover / problem / solution: с конца удаляем лишнее, затем инструкцию
    while len(prs.slides) > 4:
        delete_slide(prs, len(prs.slides) - 1)
    delete_slide(prs, 0)  # instruction

    assert len(prs.slides) == 3, len(prs.slides)
    prs.save(str(OUT))
    print(f"Saved {OUT} ({len(prs.slides)} slides)")
    print(f"Template backup {BACKUP}")


if __name__ == "__main__":
    main()
