from app.extensions.beans import name_k2e_convertor

candidate_info = {
    "leejaemyung": {
        "politicalParty": "더불어민주당",
        "politicalPartyEng": name_k2e_convertor.get_political_party_eng_name("더불어민주당"),
        "candidate": "이재명",
        "candidateEng": name_k2e_convertor.get_candidate_eng_name("이재명")
    },
    "kimmoonsoo": {
        "politicalParty": "국민의힘",
        "politicalPartyEng": name_k2e_convertor.get_political_party_eng_name("국민의힘"),
        "candidate": "김문수",
        "candidateEng": name_k2e_convertor.get_candidate_eng_name("김문수")
    },
    "leejunseok": {
        "politicalParty": "개혁신당",
        "politicalPartyEng": name_k2e_convertor.get_political_party_eng_name("개혁신당"),
        "candidate": "이준석",
        "candidateEng": name_k2e_convertor.get_candidate_eng_name("이준석")
    }
}
