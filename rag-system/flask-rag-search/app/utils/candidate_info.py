from typing import Optional

candidate_info = {
    "leejaemyung": {
        "political_party": "더불어민주당",
        "political_party_eng": "theminjoo",
        "candidate": "이재명",
        "candidate_eng": "leejaemyung",
    },
    "kimmoonsoo": {
        "political_party": "국민의힘",
        "political_party_eng": "peoplepowerparty",
        "candidate": "김문수",
        "candidate_eng": "kimmoonsoo",
    },
    "leejunseok": {
        "political_party": "개혁신당",
        "political_party_eng": "reformparty",
        "candidate": "이준석",
        "candidate_eng": "leejunseok",
    },
}


def get_candidate_info(candidate: str) -> Optional[dict]:
    if candidate in candidate_info:
        # 입력 candidate이 후보자 영문명이면 여기서 찾아 리턴
        return candidate_info.get(candidate)

    # 입력 candidate이 한글명인 경우 info.candidate에서 찾아 리턴
    for info in candidate_info.values():
        if info.get("candidate") == candidate:
            return info

    return None
