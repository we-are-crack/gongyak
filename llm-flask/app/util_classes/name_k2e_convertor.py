class NameKor2EngConvertor:
    def __init__(self):
        self.candidate = {
            "이재명" : "leejaemyung",
            "김문수" : "kimmoonsoo",
            "이준석" : "leejunseok"
        }

        self.political_party = {
            "더불어민주당": "theminjoo",
            "국민의힘": "peoplepowerparty",
            "개혁신당": "reformparty"
        }

    def get_candidate_eng_name(self, candidate_kor_name: str, default_val: str = "tempcandidate") -> str:
        return self.candidate.get(candidate_kor_name, default_val)

    def get_political_party_eng_name(self, political_party_kor_name: str, default_val: str = "temppoliticalparty") -> str:
        return self.political_party.get(political_party_kor_name, default_val)