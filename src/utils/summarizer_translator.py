import openai, os
openai.api_key = os.getenv("OPENAI_API_KEY")

def summarize_translate(content, lang="fr"):
    prompt = f"""Résume cet article en 5 à 10 phrases claires et structurées, en français, même si le texte d’origine est en anglais. Ne fais pas une introduction, ni une conclusion inutile.\n\nARTICLE :\n{content}"""
    try:
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=500,
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print("❌ Erreur résumé/traduction :", e)
        return None