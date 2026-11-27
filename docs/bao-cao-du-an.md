# BÁO CÁO ĐỒ ÁN TỐT NGHIỆP

**ĐỀ TÀI:**  
### NGHIÊN CỨU VÀ PHÁT TRIỂN HỆ THỐNG WEBSITE DU LỊCH THÔNG MINH TÍCH HỢP TRÍ TUỆ NHÂN TẠO (AI)

---

## LỜI CẢM ƠN

Lời đầu tiên, em xin gửi lời cảm ơn chân thành tới Ban Giám hiệu **Trường Đại học Phenikaa** cùng toàn thể quý Thầy Cô giáo trong **Khoa Công nghệ Thông tin** đã tận tình giảng dạy, truyền đạt những tri thức quý báu và tạo điều kiện thuận lợi cho em trong suốt quá trình học tập tại trường.

Đặc biệt, em xin bày tỏ lòng biết ơn sâu sắc nhất tới **Thầy/Cô Nguyễn Văn A** – Giảng viên hướng dẫn trực tiếp. Thầy/Cô đã luôn dành thời gian định hướng, tận tình chỉ bảo chuyên môn và hỗ trợ em trong suốt quá trình nghiên cứu, triển khai và hoàn thành đồ án tốt nghiệp.

Em cũng xin cảm ơn gia đình và bạn bè đã luôn đồng hành, động viên em. Dù đã nỗ lực hoàn thiện đề tài, đồ án khó tránh khỏi những thiếu sót, em rất mong nhận được ý kiến đóng góp quý báu từ quý Thầy Cô.

*Em xin chân thành cảm ơn!*

---

## TÓM TẮT ĐỒ ÁN TỐT NGHIỆP

Đồ án hướng tới xây dựng một hệ thống website du lịch thông minh toàn diện, giúp kết nối khách hàng với các nhà cung cấp dịch vụ du lịch (tour, phòng khách sạn, nhà hàng) và tối ưu hóa toàn bộ trải nghiệm chuyến đi trên một nền tảng thống nhất. Trong bối cảnh ngành du lịch chuyển đổi số mạnh mẽ, việc người dùng phải tra cứu, đối chiếu thông tin qua nhiều kênh rời rạc (từ lịch trình tham quan, phòng lưu trú đến ẩm thực) thường làm dữ liệu bị phân tán, tốn nhiều thời gian chuẩn bị và thiếu khả năng hỗ trợ tức thời theo nhu cầu cá nhân. Đồng thời, các đơn vị cung cấp dịch vụ cũng gặp khó khăn trong việc quản lý tập trung đơn đặt, tiếp cận khách hàng tiềm năng và theo dõi hiệu quả kinh doanh. Vì vậy, hệ thống được nghiên cứu và phát triển nhằm tập trung hóa chuỗi cung ứng dịch vụ du lịch, giảm thiểu các thao tác thủ công và mang lại trải nghiệm lập kế hoạch, đặt chỗ liền mạch, trực quan cho người dùng.

Hệ thống hỗ trợ đầy đủ các nghiệp vụ thực tế cho ba nhóm tác nhân chính: Khách hàng, Nhà cung cấp dịch vụ và Quản trị viên hệ thống. Khách hàng có thể tìm kiếm thông minh theo địa điểm, ngân sách, thời gian, sở thích; xem bản đồ vị trí, hình ảnh thực tế và đặt chỗ đa dịch vụ kèm thanh toán trực tuyến an toàn qua PayPal với cơ chế ký quỹ, hoàn tiền và chi trả doanh thu tự động (Payouts). Do giới hạn thời gian thu thập dữ liệu, hệ thống tập trung xây dựng cơ sở dữ liệu dịch vụ chuyên sâu tại 2 địa phương du lịch tiêu biểu là Ninh Bình và Hải Phòng. Nhà cung cấp được cung cấp phân hệ quản lý hồ sơ doanh nghiệp, quản trị danh mục dịch vụ, lịch khởi hành/phòng/bàn, theo dõi lịch đặt và báo cáo doanh thu. Quản trị viên kiểm soát quy trình xét duyệt nhà cung cấp, kiểm duyệt nội dung, quản lý điểm đến và giám sát toàn bộ hoạt động sàn thương mại điện tử. Điểm nổi bật của đề tài là việc tích hợp sâu các công nghệ Trí tuệ nhân tạo (AI) hiện đại, bao gồm: trợ lý ảo Chatbot AI tư vấn du lịch thời gian thực theo ngữ cảnh ứng dụng kỹ thuật RAG (Retrieval-Augmented Generation) kết hợp mô hình ngôn ngữ lớn (LLM); hệ thống lập lịch trình thông minh cá nhân hóa (AI Trip Planner) tự động đề xuất lộ trình và tối ưu hóa quãng đường di chuyển dựa trên Google Routes API; cùng cơ chế AI phân tích ngữ nghĩa để tự động kiểm duyệt nội dung đánh giá và phát hiện spam.

Về mặt công nghệ, hệ thống được kiến trúc theo mô hình Full-stack hiện đại với framework Next.js 16 (App Router, Server Actions, React 19, TypeScript), kết hợp cơ sở dữ liệu quan hệ PostgreSQL thông qua Prisma ORM đảm bảo tính toàn vẹn dữ liệu giao dịch. Khả năng tìm kiếm ngữ nghĩa và lưu trữ vector phục vụ RAG được đảm nhiệm bởi Pinecone Vector Database kết hợp mô hình nhúng Gemini Embedding. Phân hệ trí tuệ nhân tạo được xây dựng trên nền tảng Vercel AI SDK và Google Gemini trên Google Cloud Vertex AI, kết hợp Google Places và Routes API để xử lý thông tin địa điểm và bản đồ số thực tế. Toàn bộ các tương tác và độ trễ của mô hình AI được giám sát, truy vết chi tiết thông qua hệ thống Langfuse (OpenTelemetry). Việc phân tách kiến trúc module hóa rõ ràng theo chuẩn Feature/Entity giúp hệ thống đạt độ tin cậy cao, dễ bảo trì, mở rộng và sẵn sàng phục vụ lượng truy cập lớn.

Kết quả của đồ án đã xây dựng thành công một sản phẩm website du lịch thông minh hoàn chỉnh, có tính ứng dụng cao và giao diện thân thiện với người dùng. Đề tài không chỉ giải quyết bài toán số hóa quy trình kinh doanh dịch vụ du lịch truyền thống mà còn minh chứng cho tiềm năng to lớn của việc ứng dụng Trí tuệ nhân tạo thế hệ mới (Generative AI, RAG, Semantic Search) vào việc nâng tầm trải nghiệm du khách. Đồng thời, đề tài thể hiện việc vận dụng chuyên sâu các kiến thức về phân tích yêu cầu, thiết kế hệ thống, phát triển phần mềm, tích hợp mô hình AI và tổ chức dữ liệu vào một bài toán thực tế.

---

## DANH MỤC CÁC TỪ VIẾT TẮT

> **Quy định sử dụng viết tắt:** Báo cáo chỉ sử dụng các từ viết tắt được liệt kê chính thức trong bảng danh mục dưới đây. Tất cả các thuật ngữ chuyên môn hoặc khái niệm khác không có trong danh mục này đều được viết đầy đủ nhằm đảm bảo tính chuẩn mực, trong sáng và tính nhất quán của đồ án tốt nghiệp.

| STT | Từ viết tắt | Thuật ngữ tiếng Anh (Đầy đủ) | Ý nghĩa / Giải thích tiếng Việt |
|:---:|:---|:---|:---|
| 1 | **AI** | Artificial Intelligence | Trí tuệ nhân tạo |
| 2 | **API** | Application Programming Interface | Giao diện lập trình ứng dụng |
| 3 | **CDN** | Content Delivery Network | Mạng phân phối nội dung |
| 4 | **CSDL** | Cơ sở dữ liệu | Hệ thống lưu trữ dữ liệu có cấu trúc (Database) |
| 5 | **CNTT** | Công nghệ thông tin | Ngành khoa học công nghệ thông tin |
| 6 | **ERD** | Entity-Relationship Diagram | Sơ đồ quan hệ thực thể |
| 7 | **FIT** | Free Independent Traveler | Khách du lịch tự túc / tự do |
| 8 | **GIS** | Geographic Information System | Hệ thống thông tin địa lý |
| 9 | **GMV** | Gross Merchandise Volume | Tổng giá trị giao dịch hàng hóa trên sàn |
| 10 | **HTTP / HTTPS** | HyperText Transfer Protocol (Secure) | Giao thức truyền tải siêu văn bản (bảo mật) |
| 11 | **ISR** | Incremental Static Regeneration | Cơ chế tái tạo trang tĩnh gia tăng |
| 12 | **JSON** | JavaScript Object Notation | Định dạng chuẩn trao đổi dữ liệu dạng văn bản |
| 13 | **JWT** | JSON Web Token | Chuỗi mã hóa dữ liệu phục vụ xác thực người dùng |
| 14 | **LLM** | Large Language Model | Mô hình ngôn ngữ lớn |
| 15 | **NLP** | Natural Language Processing | Xử lý ngôn ngữ tự nhiên |
| 16 | **ORM** | Object-Relational Mapping | Kỹ thuật ánh xạ đối tượng - cơ sở dữ liệu quan hệ |
| 17 | **OTA** | Online Travel Agent | Đại lý du lịch trực tuyến |
| 18 | **RAG** | Retrieval-Augmented Generation | Kỹ thuật tăng cường truy xuất thông tin cho mô hình AI tạo sinh |
| 19 | **RBAC** | Role-Based Access Control | Cơ chế kiểm soát truy cập dựa trên vai trò |
| 20 | **RDBMS** | Relational Database Management System | Hệ quản trị cơ sở dữ liệu quan hệ |
| 21 | **REST** | Representational State Transfer | Kiểu kiến trúc truyền tải trạng thái cho dịch vụ web (RESTful) |
| 22 | **SEO** | Search Engine Optimization | Tối ưu hóa công cụ tìm kiếm |
| 23 | **SMEs** | Small and Medium-sized Enterprises | Doanh nghiệp có quy mô vừa và nhỏ |
| 24 | **SSR** | Server-Side Rendering | Cơ chế kết xuất giao diện phía máy chủ |
| 25 | **UI** | User Interface | Giao diện người dùng |
| 26 | **UX** | User Experience | Trải nghiệm người dùng |

---

# CHƯƠNG 1: GIỚI THIỆU ĐỀ TÀI

## 1.1. Đặt vấn đề

### 1.1.1. Bối cảnh thực tiễn ngành du lịch trong kỷ nguyên số
Trong tiến trình phát triển kinh tế - xã hội hiện đại, du lịch được xác định là một trong những ngành kinh tế mũi nhọn, đóng góp tỷ trọng lớn vào Tổng sản phẩm quốc nội (GDP) của nhiều quốc gia, trong đó có Việt Nam. Cùng với sự bùng nổ của hạ tầng Internet tốc độ cao, thiết bị di động thông minh và các dịch vụ thanh toán không tiền mặt, hành vi của du khách đã có sự chuyển biến mang tính căn bản. Khái niệm du lịch truyền thống – vốn gắn liền với các đoàn tour khép kín có lịch trình cố định sẵn – đang dần nhường chỗ cho xu hướng du lịch tự túc (Free Independent Traveler – FIT) và du lịch trải nghiệm cá nhân hóa. Ngày nay, du khách đề cao sự chủ động, mong muốn tự do khám phá các điểm đến độc đáo, thưởng thức ẩm thực bản địa và điều chỉnh kế hoạch chuyến đi linh hoạt theo sở thích, thời gian và khả năng tài chính riêng của bản thân hoặc gia đình.

Song hành cùng xu hướng đó, làn sóng chuyển đổi số quốc gia đang thúc đẩy mạnh mẽ quá trình hình thành hệ sinh thái **Du lịch thông minh (Smart Tourism)**. Chính phủ và các cơ quan quản lý du lịch đã ban hành nhiều đề án nhằm đẩy mạnh ứng dụng công nghệ thông tin vào việc xúc tiến, quảng bá điểm đến, hỗ trợ du khách và số hóa hoạt động kinh doanh lữ hành. Nhu cầu về các nền tảng số có khả năng cung cấp thông tin toàn diện, minh bạch và hỗ trợ người dùng từ khâu chuẩn bị, trải nghiệm cho đến khi kết thúc chuyến đi ngày càng trở nên cấp bách.

### 1.1.2. Những bất cập và nút thắt trong các giải pháp hiện tại
Mặc dù thị trường đã xuất hiện nhiều ứng dụng và trang web dịch vụ du lịch trực tuyến (Online Travel Agent – OTA), cả người tiêu dùng lẫn các đơn vị kinh doanh dịch vụ du lịch hiện nay vẫn đang đối mặt với nhiều bất cập và khó khăn chưa được giải quyết triệt để:

1. **Sự phân mảnh dữ liệu và hiện tượng quá tải nhận thức (Cognitive Overload):**  
   Để chuẩn bị cho một chuyến du lịch trọn vẹn, du khách thường phải trải qua quy trình tra cứu phức tạp, rời rạc trên nhiều nền tảng khác nhau: đọc bài viết chia sẻ kinh nghiệm trên mạng xã hội hoặc diễn đàn, tìm và đặt phòng lưu trú trên các trang OTA quốc tế, tìm kiếm tour trải nghiệm trên các trang lữ hành nội địa, và tự tra cứu quán ăn, phương tiện đi lại qua các ứng dụng bản đồ. Việc dữ liệu bị phân tán khiến người dùng phải mở hàng chục tab trình duyệt, đối chiếu thông tin thủ công, tốn nhiều giờ hoặc thậm chí nhiều ngày để tổng hợp chi phí và lịch trình.

2. **Nghịch lý trong bài toán lập kế hoạch chuyến đi (Itinerary Planning Problem):**  
   Về bản chất khoa học máy tính, việc lập kế hoạch du lịch là một bài toán tối ưu hóa đa mục tiêu kết hợp (Multi-objective Combinatorial Optimization) vô cùng phức tạp. Người dùng phải cân đối đồng thời giữa: thời gian hoạt động của các điểm tham quan, khoảng cách địa lý thực tế giữa các điểm dừng, phương tiện di chuyển, ngân sách dự kiến, và thể lực cũng như thói quen sinh hoạt của từng thành viên trong đoàn. Khi thực hiện thủ công, du khách rất dễ sắp xếp lịch trình không hợp lý (ví dụ: các điểm đến quá xa nhau, di chuyển lòng vòng gây lãng phí thời gian và nhiên liệu, hoặc lịch trình quá dày đặc gây kiệt sức).

3. **Hạn chế cố hữu của các hệ thống OTA truyền thống:**  
   Đa số các trang web du lịch hiện nay vẫn dựa trên phương pháp tìm kiếm từ khóa chính xác và các bộ lọc phân cấp tĩnh (Faceted Search: lọc theo giá, số sao, quận/huyện). Cơ chế này không thể xử lý được các nhu cầu mang tính ngữ cảnh phức tạp của con người (ví dụ: *"Tôi muốn tìm một homestay gần biển ở Đà Nẵng, không gian yên tĩnh để làm việc từ xa, có bếp nấu ăn cho gia đình và giá dưới 1 triệu/đêm"*). Du khách hoàn toàn thiếu đi một công cụ hỗ trợ đối thoại tự nhiên, có khả năng lắng nghe, thấu hiểu ngữ cảnh và đưa ra gợi ý phù hợp như một chuyên gia tư vấn lữ hành thực thụ.

4. **Rào cản công nghệ đối với các nhà cung cấp dịch vụ địa phương (SMEs):**  
   Các doanh nghiệp du lịch vừa và nhỏ, hợp tác xã lữ hành địa phương, các chủ homestay hay quán ăn truyền thống thường gặp khó khăn trong việc tiếp cận các nền tảng thương mại điện tử lớn do chi phí hoa hồng cao, quy trình xét duyệt phức tạp và thiếu công cụ quản lý số hóa tinh gọn. Họ thiếu một nền tảng chuyên biệt giúp đăng bán sản phẩm, theo dõi tình trạng đơn đặt theo thời gian thực (calendar view), và quản lý doanh thu minh bạch.

5. **Vấn nạn thao túng đánh giá và bình luận rác (Fake Reviews & Spam):**  
   Đánh giá của người dùng là yếu tố quyết định tới hơn 85% hành vi đặt dịch vụ. Tuy nhiên, tình trạng các bài đánh giá ảo, bình luận rác, nội dung quảng cáo không đúng sự thật hoặc các lời lẽ tiêu cực mang tính cạnh tranh không lành mạnh đang diễn ra phổ biến. Các hệ thống hiện hành thiếu bộ lọc ngữ nghĩa thông minh để tự động phân tích và kiểm soát chất lượng nội dung đánh giá trước khi công bố.

### 1.1.3. Cơ hội từ Trí tuệ nhân tạo (AI) và tính cấp thiết của đề tài
Trong hai năm trở lại đây, sự bứt phá của **Trí tuệ nhân tạo tạo sinh (Generative AI)**, đặc biệt là các **Mô hình ngôn ngữ lớn (LLM)** thế hệ mới kết hợp với kỹ thuật **Tăng cường truy xuất thông tin (Retrieval-Augmented Generation – RAG)** và **Cơ sở dữ liệu Vector (Vector Database)**, đã tạo ra một bước ngoặt công nghệ chưa từng có. AI ngày nay không chỉ có khả năng hiểu sâu ngôn ngữ tự nhiên, ghi nhớ ngữ cảnh hội thoại mà còn có thể tương tác với các hệ thống bên ngoài thông qua cơ chế gọi công cụ (Function Calling / Tool Calling).

Khi kết hợp năng lực suy luận của AI với dữ liệu bản đồ số không gian thời gian thực (Geospatial & Routing APIs) và hệ cơ sở dữ liệu quan hệ chặt chẽ, ta hoàn toàn có thể xây dựng một hệ thống website du lịch thế hệ mới: nơi du khách vừa có thể trò chuyện tự nhiên với trợ lý ảo để được tư vấn dịch vụ, tự động sinh lịch trình tối ưu quãng đường di chuyển trên bản đồ, vừa có thể tiến hành đặt tour, phòng khách sạn, bàn nhà hàng và thanh toán trực tuyến trong một trải nghiệm duy nhất.

Xuất phát từ những phân tích thực tiễn và cơ sở công nghệ trên, đề tài **"Nghiên cứu và phát triển hệ thống website du lịch thông minh tích hợp Trí tuệ nhân tạo (AI)"** (với sản phẩm phần mềm mang thương hiệu **Roamly**) được lựa chọn thực hiện nhằm mang lại một giải pháp công nghệ toàn diện, thiết thực và có giá trị ứng dụng cao cho ngành du lịch số.

---

## 1.2. Mục tiêu và phạm vi nghiên cứu

### 1.2.1. Mục tiêu của đề tài

* **Mục tiêu chung:**  
  Nghiên cứu, làm chủ các kỹ thuật Trí tuệ nhân tạo hiện đại (LLM, RAG, Semantic Vector Search, NLP Content Moderation) kết hợp với các dịch vụ bản đồ số (Google Places, Google Routes); từ đó thiết kế, phát triển và triển khai thử nghiệm hoàn chỉnh hệ thống website du lịch thông minh **Roamly** trên môi trường thực tế, đáp ứng đầy đủ chu trình nghiệp vụ của một sàn thương mại điện tử du lịch tích hợp trợ lý ảo cá nhân hóa.

* **Mục tiêu cụ thể:**
  1. *Về phương diện nghiên cứu khoa học và công nghệ:*
     - Nghiên cứu cơ chế vận hành của mô hình ngôn ngữ lớn (Google Gemini 2.5 Flash trên nền tảng đám mây Google Cloud Vertex AI) và giải pháp xây dựng Prompt Engineering tối ưu cho bài toán du lịch.
     - Nghiên cứu và hiện thực hóa kiến trúc **RAG (Retrieval-Augmented Generation)**: neo tri thức của mô hình vào cơ sở dữ liệu thực tế của hệ thống và API ngoại vi, triệt tiêu hiện tượng mô hình tự sinh thông tin sai lệch (hallucination).
     - Nghiên cứu kỹ thuật biểu diễn ngữ nghĩa của văn bản thành vector đặc trưng nhiều chiều (Vector Embeddings) và cơ chế tìm kiếm độ tương đồng Cosine Similarity trên cơ sở dữ liệu vector chuyên dụng **Pinecone**.
     - Nghiên cứu mô hình toán học và giải pháp tính toán ma trận khoảng cách, thời gian di chuyển thực tế từ Google Routes API để tự động sắp xếp các điểm tham quan theo lộ trình tối ưu nhất.
     - Nghiên cứu ứng dụng xử lý ngôn ngữ tự nhiên (NLP) nhằm phân tích cảm xúc (Sentiment Analysis), phát hiện và phân loại tự động các nội dung đánh giá vi phạm, độc hại hoặc spam.

  2. *Về phương diện kỹ thuật phần mềm và phát triển hệ thống:*
     - Thiết kế kiến trúc phần mềm Full-stack hiện đại, tuân thủ nguyên lý thiết kế phân lớp (Clean Architecture / Feature-driven Architecture) với **Next.js 16 (App Router, Server Actions, React 19, TypeScript)**.
     - Thiết kế và chuẩn hóa cơ sở dữ liệu quan hệ **PostgreSQL** thông qua **Prisma ORM 7**, đảm bảo tính toàn vẹn dữ liệu giao dịch (ACID) cho các luồng đặt chỗ phức tạp.
     - Xây dựng hệ thống phân quyền kiểm soát truy cập dựa trên vai trò (Role-Based Access Control – RBAC) bảo mật tuyệt đối cho 3 nhóm đối tượng: Khách hàng (Customer), Nhà cung cấp dịch vụ (Provider) và Quản trị viên (Admin).
     - Hiện thực hóa đầy đủ chuỗi nghiệp vụ đặt chỗ đa dịch vụ: Tour du lịch (theo lịch khởi hành), Cơ sở lưu trú (theo loại phòng và ngày check-in/out), và Nhà hàng ẩm thực (theo khung giờ và sức chứa).
     - Tích hợp cổng thanh toán trực tuyến quốc tế **PayPal** theo mô hình ký quỹ an toàn (Escrow), tự động hóa quy trình thanh toán giữ chỗ, xuất hóa đơn điện tử, hủy đơn hoàn tiền và chi trả doanh thu (Payouts) cho đối tác sau khi trừ hoa hồng sàn.
     - Xây dựng phân hệ Lập kế hoạch chuyến đi thông minh (**AI Trip Planner**) với giao diện tương tác trực quan, kết xuất lịch trình chi tiết và trực quan hóa tuyến đường di chuyển trên bản đồ Leaflet / Google Maps.
     - Xây dựng hệ thống báo cáo thống kê chuyên sâu với biểu đồ trực quan hóa doanh thu, đơn hàng (ApexCharts) và hỗ trợ xuất dữ liệu định dạng chuẩn Microsoft Excel (`.xlsx`).
     - Tích hợp nền tảng quan sát và đánh giá chất lượng mô hình AI (**Langfuse**) theo chuẩn OpenTelemetry để theo dõi thời gian đáp ứng (latency), lượng token tiêu thụ và độ chính xác của các phiên gọi công cụ (tool call).

### 1.2.2. Đối tượng và phạm vi nghiên cứu

* **Đối tượng nghiên cứu:**  
  - Các kỹ thuật Trí tuệ nhân tạo thế hệ mới: Large Language Models (LLM), Retrieval-Augmented Generation (RAG), Vector Embeddings, Semantic Search.
  - Các dịch vụ nền tảng số: Google Maps Platform (Places API, Routes API), Cổng thanh toán quốc tế PayPal REST API, CSDL quan hệ PostgreSQL, CSDL vector Pinecone, và hạ tầng CDN ImageKit.
  - Quy trình nghiệp vụ sàn thương mại điện tử du lịch trực tuyến: Quản lý danh mục sản phẩm, đặt chỗ đa dịch vụ, quản trị đơn hàng, ký quỹ - quyết toán tài chính và kiểm duyệt nội dung cộng đồng.

* **Phạm vi không gian và dữ liệu:**  
  - Trong khuôn khổ thời gian thực hiện đồ án tốt nghiệp, việc thu thập, chuẩn hóa và xác thực dữ liệu chi tiết (tọa độ GPS, hình ảnh bản quyền, khung giá, chính sách phòng/vé/bàn) trên phạm vi toàn quốc gặp nhiều thách thức lớn về mặt thời gian và nguồn lực. Do đó, **đề tài chủ động lựa chọn tập trung nghiên cứu và xây dựng bộ dữ liệu chuyên sâu cho 2 tỉnh/thành phố trọng điểm đại diện cho hai loại hình du lịch đặc trưng tại miền Bắc**:
    1. **Ninh Bình:** Đại diện cho loại hình du lịch di sản văn hóa, tâm linh và sinh thái cảnh quan (Quần thể danh thắng Tràng An, Cố đô Hoa Lư, Tam Cốc - Bích Động, Chùa Bái Đính...).
    2. **Hải Phòng:** Đại diện cho loại hình du lịch biển đảo, nghỉ dưỡng và khám phá ẩm thực đô thị đặc sắc (Quần đảo Cát Bà, Vịnh Lan Hạ, Bãi biển Đồ Sơn và tuyến du lịch ẩm thực Food Tour Hải Phòng).
  - Dữ liệu dịch vụ tại 2 địa phương này bao gồm: Các tour du lịch lữ hành, cơ sở lưu trú (khách sạn/homestay/resort), nhà hàng ẩm thực địa phương và các bài viết cẩm nang hướng dẫn trải nghiệm.

* **Phạm vi người dùng:**  
  - Phục vụ đồng thời 3 nhóm tác nhân trong cùng một hệ sinh thái web: Du khách (người dùng cuối), Doanh nghiệp/Chủ cơ sở cung cấp dịch vụ, và Đội ngũ quản trị viên vận hành sàn.

* **Giới hạn của đề tài:**  
  - Hệ thống được triển khai thử nghiệm trên môi trường Web ứng dụng công nghệ Responsive Web Design, tương thích hiển thị trên cả trình duyệt máy tính và điện thoại thông minh; đề tài không xây dựng ứng dụng di động độc lập (Native Mobile App trên iOS/Android).
  - Về giải pháp thanh toán: Hệ thống tập trung tích hợp và chuẩn hóa quy trình giao dịch qua cổng thanh toán quốc tế **PayPal**, tận dụng tính năng **PayPal Payouts** phục vụ mô hình sàn thương mại điện tử trung gian, chưa mở rộng sang các cổng thanh toán nội địa.
  - Dữ liệu địa điểm và tuyến đường di chuyển trong phân hệ AI Trip Planner được đồng bộ thông qua API chính thống của Google Maps và Google Routes với phạm vi dữ liệu giao thông đường bộ hiện hành.

---

## 1.3. Định hướng giải pháp

Để giải quyết một cách triệt để các thách thức trong bài toán đặt ra, đề tài đề xuất và triển khai 5 định hướng giải pháp kỹ thuật và nghiệp vụ chủ đạo:

### 1.3.1. Hợp nhất chuỗi cung ứng dịch vụ du lịch trên nền tảng thương mại điện tử đa chiều
Thay vì phân tán người dùng qua các dịch vụ riêng lẻ, hệ thống được thiết kế theo mô hình nền tảng đa bên (Multi-sided Platform) khép kín:
- **Khách hàng** được cung cấp một "trạm dừng chân một điểm" (One-stop Platform): từ lúc tìm kiếm nguồn cảm hứng, đọc cẩm nang kinh nghiệm, trò chuyện với trợ lý AI, thiết lập lịch trình cá nhân hóa, đến khi trực tiếp đặt vé tour, đặt phòng khách sạn, giữ bàn nhà hàng và thanh toán trực tuyến an toàn.
- **Nhà cung cấp** sở hữu một phân hệ quản trị chuyên biệt (Provider Portal) với đầy đủ công cụ để quản lý thông tin doanh nghiệp, đăng tải các dịch vụ với các thuộc tính linh hoạt (giá vé người lớn/trẻ em, số đêm phòng, ca phục vụ nhà hàng), theo dõi tiến độ đơn hàng và xem lịch phục vụ trực quan.
- **Quản trị viên** nắm giữ quyền kiểm soát tối cao thông qua Admin Dashboard: thẩm định giấy phép và hồ sơ của đối tác, phê duyệt bài viết, kiểm duyệt đánh giá và điều phối chính sách hoa hồng sàn (`PLATFORM_COMMISSION_RATE`).

### 1.3.2. Kiến trúc AI có neo dữ liệu thực tế và gọi công cụ thời gian thực (Grounded RAG)
Nhằm khắc phục hoàn toàn nhược điểm tự tạo thông tin giả (hallucination) thường gặp ở các mô hình ngôn ngữ lớn, đề tài áp dụng kiến trúc **RAG kết hợp Function Calling / Tool Calling**:
- Khi người dùng gửi câu hỏi tới Trợ lý ảo (Roamly AI), mô hình ngôn ngữ lớn (Gemini 2.5 Flash) không tự suy diễn nội dung mà phân tích ý định (Intent Recognition) để kích hoạt các "công cụ" (Tools) đã được lập trình sẵn.
- Hệ thống cung cấp các công cụ truy vấn dữ liệu thời gian thực: công cụ tìm kiếm tour, khách sạn trong CSDL PostgreSQL; công cụ tìm kiếm ngữ nghĩa theo vector qua Pinecone; và công cụ truy vấn thông tin địa điểm thực tế qua Google Places API.
- Mô hình AI nhận kết quả JSON trả về từ các công cụ, tổng hợp lại thành văn bản đối thoại tự nhiên, đồng thời trả về các thành phần giao diện động (UI Cards) chứa đầy đủ hình ảnh, giá cả, đánh giá sao để người dùng có thể nhấp chuột vào xem chi tiết hoặc đặt chỗ ngay trong luồng hội thoại.

### 1.3.3. Lập lịch trình thông minh kết hợp mô hình AI và API bản đồ số (Hybrid AI-GIS Routing)
Giải quyết bài toán lập kế hoạch chuyến đi bằng sự kết hợp hài hòa giữa trí tuệ nhân tạo và hệ thống thông tin địa lý (GIS):
- **Tầng AI (Ngữ nghĩa & Thói quen):** Phân tích các tiêu chí đầu vào của du khách (thời lượng, ngân sách, thành phần đoàn du lịch, sở thích) để lựa chọn danh sách các điểm tham quan tương thích, phân bổ hợp lý vào các khung thời gian trong ngày (Buổi sáng: tham quan văn hóa/di tích; Buổi trưa: thưởng thức ẩm thực bản địa; Buổi chiều: vui chơi/biển đảo; Buổi tối: chợ đêm/nghỉ ngơi).
- **Tầng GIS (Toán học & Địa lý):** Tích hợp **Google Routes API** để tính toán khoảng cách vật lý (km) và thời gian di chuyển dự kiến giữa các điểm dừng chân liên tiếp; vẽ đường đi thực tế (polyline) trực quan trên bản đồ tương tác. Cơ chế này đảm bảo lịch trình sinh ra có tính khả thi cao nhất, loại bỏ hoàn toàn tình trạng di chuyển lòng vòng, chéo cung đường.

### 1.3.4. Kiểm duyệt nội dung đánh giá đa tầng bằng Trí tuệ nhân tạo
Nhằm bảo vệ tính minh bạch và uy tín của sàn, hệ thống xây dựng quy trình kiểm duyệt nội dung đánh giá kết hợp:
- **Tầng quy tắc cứng (Rule-based Filtering):** Kiểm tra quyền đánh giá (chỉ khách hàng đã hoàn thành đơn đặt dịch vụ thực tế mới được quyền viết đánh giá), phát hiện các từ khóa vi phạm tiêu chuẩn cộng đồng.
- **Tầng phân tích ngữ nghĩa AI (Semantic AI Moderation):** Sử dụng mô hình ngôn ngữ để phân tích ngữ cảnh của bài đánh giá, tự động phát hiện các nội dung mang tính chất quảng cáo rác (spam links), ngôn từ kích động bạo lực, xúc phạm danh dự hoặc đánh giá có dấu hiệu tiêu cực bất thường. Các trường hợp nghi vấn sẽ tự động được gắn cờ cảnh báo (Flagged) để Quản trị viên xử lý, ngăn chặn việc hiển thị công khai trên giao diện.

### 1.3.5. Cơ chế ký quỹ thanh toán an toàn và quyết toán tự động qua PayPal Payouts
Trong mô hình kinh doanh sàn thương mại điện tử đa bên (Multi-sided Platform), luồng tài chính đòi hỏi giải quyết đồng thời hai chiều giao dịch: thu tiền từ khách hàng khi đặt chỗ (Pay-in) và giải ngân chi trả doanh thu cho nhà cung cấp dịch vụ sau khi dịch vụ hoàn tất (Payout). 

Hầu hết các cổng thanh toán nội địa tại Việt Nam hiện nay chủ yếu hỗ trợ chiều thu tiền (C2B) và quy trình cấp quyền API chi trả tự động hàng loạt (B2C/B2B Payouts) đòi hỏi hồ sơ doanh nghiệp pháp nhân lớn cùng các thỏa thuận ngân hàng phức tạp, khó khả thi trong khuôn khổ một đề tài tốt nghiệp của sinh viên. Do đó, **cổng thanh toán PayPal được lựa chọn làm giải pháp cốt lõi cho hệ thống nhờ sở hữu tính năng PayPal Payouts API**:
- **Ký quỹ bảo vệ dòng tiền (Escrow):** Toàn bộ số tiền thanh toán khi khách hàng đặt chỗ được giữ an toàn tại tài khoản trung gian của sàn Roamly, đảm bảo quyền lợi cho khách hàng.
- **Tự động hóa hoàn tiền (Automated Refund):** Khách hàng được quyền hủy đơn và nhận tiền hoàn tự động trực tiếp về tài khoản PayPal nếu việc hủy tuân thủ đúng chính sách thời hạn hủy của dịch vụ.
- **Tự động chi trả doanh thu qua PayPal Payouts:** Sau khi khách hàng sử dụng dịch vụ thành công và đơn hàng được chuyển sang trạng thái Hoàn thành (`COMPLETED`), hệ thống sẽ tự động kích hoạt API **PayPal Payouts** để giải ngân doanh thu thực nhận (sau khi đã tự động khấu trừ tỷ lệ hoa hồng của sàn) chuyển thẳng về tài khoản PayPal mà nhà cung cấp đã liên kết trong hồ sơ doanh nghiệp. Cơ chế này loại bỏ hoàn toàn các thao tác đối soát và chuyển khoản thủ công, đảm bảo tính minh bạch, chính xác tuyệt đối.

---

## 1.4. Bố cục của Đồ án

Báo cáo đồ án tốt nghiệp được trình bày khoa học, mạch lạc thành 6 chương với cấu trúc nội dung chi tiết như sau:

* **Chương 1: Giới thiệu đề tài**  
  Trình bày bức tranh tổng quan về bối cảnh chuyển đổi số ngành du lịch, nêu bật tính cấp thiết của đề tài; phân tích những bất cập, hạn chế của các giải pháp hiện hành; xác định rõ mục tiêu nghiên cứu (về mặt học thuật và phát triển hệ thống), đối tượng, phạm vi và giới hạn của đề tài; đề xuất các định hướng giải pháp kỹ thuật cốt lõi và giới thiệu bố cục của toàn bộ báo cáo.

* **Chương 2: Phân tích nghiệp vụ và yêu cầu hệ thống**  
  Khảo sát và mô tả chi tiết vai trò của 3 nhóm tác nhân (Khách hàng, Nhà cung cấp, Quản trị viên); phân tích toàn diện các yêu cầu chức năng cho từng phân hệ và các yêu cầu phi chức năng (về mặt hiệu năng, bảo mật, độ tin cậy, giao diện); xây dựng sơ đồ ca sử dụng tổng quan và chi tiết (Use Case Diagram); mô tả các luồng quy trình nghiệp vụ cốt lõi (đặt tour, đặt phòng, đặt bàn, luồng thanh toán ký quỹ và quyết toán doanh thu).

* **Chương 3: Thiết kế kiến trúc hệ thống và cơ sở dữ liệu**  
  Trình bày chi tiết kiến trúc phân tầng tổng thể của hệ thống (Presentation, Application, Business Domain, Data & Integration Layer); thiết kế mô hình cơ sở dữ liệu quan hệ (ERD) với PostgreSQL và chuẩn hóa thông qua Prisma ORM; thiết kế cấu trúc dữ liệu vector trên Pinecone phục vụ tìm kiếm ngữ nghĩa; xây dựng mô hình bảo mật, cơ chế xác thực JWT và kiểm soát phân quyền truy cập đa cấp (RBAC) với Auth.js.

* **Chương 4: Nghiên cứu và ứng dụng Trí tuệ nhân tạo (AI)**  
  Tập trung nghiên cứu sâu về mặt lý thuyết và hiện thực hóa các giải pháp AI trong hệ thống: thiết kế kiến trúc Trợ lý ảo Roamly AI theo mô hình RAG kết hợp Function Calling; xây dựng hệ thống tìm kiếm ngữ nghĩa (Semantic Search) bằng Vector Embeddings; hiện thực hóa thuật toán lập lịch trình cá nhân hóa và tối ưu hóa tuyến đường (AI Trip Planner) kết hợp Google Routes API; cơ chế phân tích và kiểm duyệt nội dung đánh giá tự động; và giải pháp quan sát, truy vết chất lượng mô hình AI với Langfuse Tracing.

* **Chương 5: Hiện thực hóa và đánh giá kết quả thực nghiệm**  
  Giới thiệu môi trường công nghệ, công cụ phát triển và kiến trúc mã nguồn dự án; trình bày chi tiết kết quả xây dựng các giao diện, màn hình chức năng chính của cả 3 phân hệ (Customer, Provider, Admin); báo cáo kết quả kiểm thử chức năng (Functional Testing), kiểm thử hiệu năng tải trang (Lighthouse / Performance) và đánh giá độ chính xác, độ tin cậy của các tính năng AI trong môi trường vận hành thực tế.

* **Chương 6: Kết luận và hướng phát triển**  
  Tổng kết toàn bộ các kết quả chính đã hoàn thành của đồ án; đối chiếu với các mục tiêu ban đầu đề ra; thẳng thắn chỉ ra những điểm còn tồn tại, hạn chế của hệ thống; và đề xuất các định hướng nghiên cứu, cải tiến công nghệ và mở rộng tính năng trong tương lai (tích hợp thanh toán nội địa, phát triển ứng dụng di động, mở rộng mô hình AI đa phương thức Multimodal AI).



---

# CHƯƠNG 2: KHẢO SÁT VÀ PHÂN TÍCH YÊU CẦU

## 2.1. Khảo sát hiện trạng

### 2.1.1. Khảo sát các nền tảng công nghệ du lịch hiện có
Trong bối cảnh thị trường du lịch trực tuyến phát triển mạnh mẽ, các giải pháp công nghệ phục vụ du khách và doanh nghiệp lữ hành có thể được phân loại thành hai nhóm chính: các đại lý du lịch trực tuyến truyền thống (OTA) và các ứng dụng thử nghiệm ứng dụng Trí tuệ nhân tạo (AI).

1. **Các nền tảng OTA truyền thống (Booking.com, Agoda, Klook, Traveloka):**
   - *Ưu điểm:* Cơ sở dữ liệu phong phú, quy mô toàn cầu; quy trình đặt chỗ và thanh toán thẻ tín dụng chuẩn hóa; giao diện người dùng (UI) quen thuộc; hệ thống đánh giá số lượng lớn.
   - *Hạn chế:*
     + Phương thức tìm kiếm phụ thuộc hoàn toàn vào các bộ lọc tĩnh (Faceted Search: lọc theo khoảng giá, số sao, quận/huyện) và từ khóa chính xác. Người dùng không thể tìm kiếm theo ngữ cảnh phức tạp hoặc mô tả tự nhiên.
     + Thiếu khả năng lập kế hoạch và lịch trình tổng thể: Người dùng phải tự chọn từng dịch vụ đơn lẻ và tự lắp ghép lịch trình thủ công bên ngoài hệ thống.
     + Mức chiết khấu hoa hồng sàn cao (thường từ 15% đến 25%), gây áp lực tài chính lớn cho các doanh nghiệp vừa và nhỏ (SMEs).
     + Thiếu công cụ hỗ trợ tư vấn tức thời mang tính cá nhân hóa; các chatbot chăm sóc khách hàng chủ yếu là kịch bản cây quyết định tĩnh (Rule-based Chatbot) với câu trả lời định sẵn, không hiểu được nhu cầu sâu xa của du khách.

2. **Các ứng dụng Trí tuệ nhân tạo hỗ trợ du lịch sơ khai (ChatGPT, RoamAround, Tripnotes):**
   - *Ưu điểm:* Khả năng sinh ngôn ngữ tự nhiên mượt mà; tốc độ phản hồi nhanh; gợi ý được các ý tưởng du lịch phong phú.
   - *Hạn chế:*
     + Thường xuyên gặp hiện tượng thông tin ảo tưởng (hallucination) do mô hình ngôn ngữ lớn (LLM) không được neo dữ liệu thực tế (grounding) vào kho dịch vụ lữ hành có thật. Mô hình có thể gợi ý các quán ăn đã đóng cửa, khách sạn không còn hoạt động hoặc giá vé sai lệch hoàn toàn.
     + Hoàn toàn tách rời với nghiệp vụ thương mại điện tử: Người dùng chỉ xem được văn bản gợi ý, không thể tiến hành đặt chỗ (booking) hay thanh toán trực tiếp.
     + Không tối ưu hóa được quãng đường và thời gian di chuyển thực tế theo điều kiện giao thông đường bộ do thiếu sự liên kết với các giao diện lập trình ứng dụng (API) bản đồ chuyên nghiệp.

#### Bảng so sánh đối chuẩn giữa Roamly và các giải pháp hiện tại:

| Tiêu chí so sánh | Nền tảng OTA (Booking/Klook) | Trợ lý AI tổng quát (ChatGPT) | Hệ thống Roamly |
|---|:---:|:---:|:---:|
| **Tìm kiếm ngữ nghĩa (Semantic Search)** | ❌ Chỉ lọc thuộc tính cứng | ⚠️ Không có CSDL dịch vụ | ✅ Vector Search (Pinecone) |
| **Trợ lý ảo tư vấn theo ngữ cảnh (RAG)** | ❌ Chatbot kịch bản tĩnh | ⚠️ Dễ bị ảo tưởng (Hallucination) | ✅ Grounded RAG + Live Tools |
| **Lập lịch trình tối ưu lộ trình (GIS)** | ❌ Không hỗ trợ | ⚠️ Chỉ sinh văn bản ước tính | ✅ Tích hợp Google Routes API |
| **Đa dạng hóa dịch vụ lữ hành** | ⚠️ Tách rời từng ứng dụng | ❌ Không hỗ trợ | ✅ Tour, Khách sạn, Bàn nhà hàng |
| **Kiểm duyệt đánh giá tự động (NLP)** | ⚠️ Lọc từ khóa thô sơ | ❌ Không áp dụng | ✅ Phân tích ngữ nghĩa AI |
| **Tự động chi trả đối tác (Payout)** | ⚠️ Đối soát thủ công định kỳ | ❌ Không có nghiệp vụ | ✅ Tự động qua PayPal Payouts |

---

### 2.1.2. Khảo sát thực trạng tại hai địa bàn trọng điểm: Ninh Bình và Hải Phòng
Nhằm đảm bảo tính khả thi cao trong thời gian thực hiện đồ án tốt nghiệp, đề tài tập trung thu thập, số hóa và xác thực dữ liệu tại hai địa phương tiêu biểu của khu vực phía Bắc:

1. **Tỉnh Ninh Bình (Trọng điểm du lịch di sản văn hóa và danh thắng sinh thái):**
   - *Đặc điểm du lịch:* Sở hữu Di sản Văn hóa và Thiên nhiên Thế giới Quần thể danh thắng Tràng An, Cố đô Hoa Lư, Tam Cốc - Bích Động, Chùa Bái Đính, Hang Múa, Đầm Vân Long.
   - *Khảo sát nhu cầu khách du lịch (FIT):* Phần lớn du khách lựa chọn chuyến đi ngắn ngày (1 đến 2 ngày). Du khách có nhu cầu cao về việc sắp xếp thứ tự tham quan hợp lý (ví dụ: đi thuyền Tràng An vào buổi sáng khi trời mát, leo Hang Múa ngắm hoàng hôn vào buổi chiều), kết hợp đặt phòng homestay sinh thái và thưởng thức đặc sản dê núi, cơm cháy.
   - *Khảo sát thực trạng nhà cung cấp:* Các cơ sở lưu trú và nhà hàng tại Ninh Bình đa phần là doanh nghiệp gia đình hoặc hợp tác xã quy mô nhỏ. Việc nhận khách chủ yếu qua điện thoại hoặc tin nhắn mạng xã hội, dẫn đến tình trạng ghi chép sổ sách thủ công, dễ trùng lịch hoặc sót đơn vào các mùa cao điểm lễ hội.

2. **Thành phố Hải Phòng (Trọng điểm du lịch biển đảo và ẩm thực đô thị):**
   - *Đặc điểm du lịch:* Nổi tiếng với Quần đảo Cát Bà, Vịnh Lan Hạ, Bãi biển Đồ Sơn, và đặc biệt là trào lưu du lịch ẩm thực (Food Tour Hải Phòng) thu hút đông đảo giới trẻ.
   - *Khảo sát nhu cầu khách du lịch:* Du khách đến Cát Bà có nhu cầu đặt tour vịnh, chèo thuyền kayak, thuê phòng khách sạn ven biển; trong khi du khách đi Food Tour trong nội thành lại có nhu cầu tìm kiếm các quán ăn lâu đời, uy tín (bánh đa cua, bánh mì cay, chè dừa dầm) và đặt bàn trước theo khung giờ để tránh việc phải xếp hàng chờ đợi lâu.
   - *Khảo sát thực trạng nhà cung cấp:* Các nhà hàng đặc sản nội thành thường xuyên rơi vào tình trạng quá tải vào khung giờ trưa và tối các ngày cuối tuần nhưng chưa có công cụ quản lý khung giờ và sức chứa phục vụ một cách chuyên nghiệp.

---

### 2.1.3. Khảo sát quy trình thanh toán trung gian và lý do lựa chọn PayPal
Mô hình sàn thương mại điện tử du lịch đặt ra một thách thức lớn về mặt tài chính:
- Khách hàng thanh toán tiền khi đặt chỗ (Pay-in) $\rightarrow$ Tiền phải được ký quỹ an toàn trên sàn $\rightarrow$ Sau khi du khách sử dụng dịch vụ thành công, sàn mới tiến hành giải ngân chi trả doanh thu cho nhà cung cấp (Payout).
- Nếu chuyến đi bị hủy hợp lệ theo chính sách, hệ thống phải tự động hoàn tiền (Refund) cho khách hàng.

Qua khảo sát các cổng thanh toán tại thị trường Việt Nam:
- Các cổng thanh toán nội địa (như VNPay, MoMo, ZaloPay, VietQR) hỗ trợ rất tốt chiều thu tiền của khách hàng cá nhân (C2B). Tuy nhiên, dịch vụ chi trả tự động qua giao diện lập trình ứng dụng (B2C/B2B Payout API) đòi hỏi hợp đồng pháp nhân doanh nghiệp lớn, ký quỹ ngân hàng nghiêm ngặt và quy trình kiểm duyệt phức tạp, không khả thi đối với một đề tài nghiên cứu học thuật của sinh viên.
- **Lý do lựa chọn cổng thanh toán PayPal:**
  1. Hỗ trợ trọn vẹn luồng giao dịch 2 chiều: Thu tiền qua **PayPal Orders API** và chi trả tự động qua **PayPal Payouts API**.
  2. Cung cấp sẵn cơ chế hoàn tiền tức thì qua **PayPal Refund API**.
  3. Cung cấp môi trường kiểm thử (Sandbox) hoàn chỉnh, cho phép giả lập tài khoản khách hàng, tài khoản sàn và ví đối tác nhà cung cấp với đầy đủ webhook thông báo giao dịch theo thời gian thực.
  4. Phù hợp với định hướng mở rộng phục vụ du khách quốc tế trong tương lai.

---

## 2.2. Tổng quan chức năng

### 2.2.1. Xác định các tác nhân hệ thống (Actors)
Hệ thống xác định 4 tác nhân con người và 3 tác nhân hệ thống bên ngoài:

| Tác nhân | Loại tác nhân | Mô tả vai trò |
|---|:---:|---|
| **Khách vãng lai (Guest)** | Người dùng | Người truy cập website chưa thực hiện đăng nhập: xem trang chủ, tìm kiếm dịch vụ, đọc bài viết cẩm nang, tương tác với trợ lý ảo AI, sử dụng công cụ lập lịch trình. |
| **Khách hàng (Customer)** | Người dùng | Người dùng đã đăng ký/đăng nhập tài khoản cá nhân: kế thừa toàn bộ quyền của Khách vãng lai; có quyền đặt tour, đặt phòng, đặt bàn, thanh toán qua PayPal, quản lý lịch sử đơn, hủy đơn và viết đánh giá. |
| **Nhà cung cấp (Provider)** | Người dùng | Đơn vị kinh doanh tour, khách sạn, nhà hàng: tạo hồ sơ doanh nghiệp (chờ duyệt), đăng tải và quản trị dịch vụ, theo dõi lịch phục vụ, xử lý đơn đặt, nhận doanh thu qua PayPal Payouts, xem báo cáo thống kê. |
| **Quản trị viên (Admin)** | Người dùng | Đơn vị quản trị vận hành sàn: phê duyệt hồ sơ đối tác, quản lý người dùng, quản trị điểm đến Ninh Bình và Hải Phòng, quản lý bài viết cẩm nang, cấu hình tham số hệ thống và theo dõi báo cáo doanh thu toàn sàn. |
| **Hệ thống PayPal** | Hệ thống ngoài | Xử lý thanh toán giữ chỗ, webhook thông báo trạng thái đơn hàng, hoàn tiền khi hủy đơn và tự động chi trả doanh thu cho nhà cung cấp qua PayPal Payouts. |
| **Mô hình AI & Dịch vụ Bản đồ** | Hệ thống ngoài | Google Gemini trên nền tảng Vertex AI xử lý hội thoại RAG và kiểm duyệt đánh giá; Pinecone xử lý tìm kiếm vector; Google Places và Routes API xử lý dữ liệu địa điểm và tối ưu hóa tuyến đường. |
| **Dịch vụ Vercel Cron** | Hệ thống ngoài | Tự động kích hoạt các tiến trình định kỳ phía máy chủ nhằm rà soát và xóa mềm các dịch vụ đã tạm dừng quá hạn quy định. |

---

### 2.2.2. Sơ đồ Use Case tổng quan của hệ thống

```mermaid
flowchart LR
    Guest["Khách vãng lai"]
    Customer["Khách hàng"]
    Provider["Nhà cung cấp"]
    Admin["Quản trị viên"]
    PayPal["Hệ thống PayPal"]
    AI["AI & Google Maps"]
    Cron["Vercel Cron"]

    Customer -.->|Kế thừa| Guest

    subgraph RoamlySystem ["HỆ THỐNG WEBSITE DU LỊCH THÔNG MINH ROAMLY"]
        direction TB
        UC_Auth["Đăng ký / Đăng nhập"]
        UC_Search["Tìm kiếm & Khám phá dịch vụ"]
        UC_ViewDetail["Xem chi tiết, bản đồ, đánh giá"]
        UC_ChatAI["Trò chuyện với Trợ lý ảo AI"]
        UC_TripPlan["Lập kế hoạch du lịch bằng AI"]
        UC_Booking["Đặt tour / phòng / bàn"]
        UC_Payment["Thanh toán ký quỹ qua PayPal"]
        UC_CancelRefund["Hủy đơn & Nhận tiền hoàn"]
        UC_ManageOrder["Quản lý đơn đặt & Xem hóa đơn"]
        UC_Review["Viết đánh giá dịch vụ"]
        UC_ProviderProfile["Quản lý hồ sơ doanh nghiệp"]
        UC_ManageServices["Quản lý dịch vụ (Tour/Khách sạn/Nhà hàng)"]
        UC_ProcessOrder["Xử lý đơn & Lịch phục vụ"]
        UC_ProviderPayout["Nhận doanh thu tự động (Payout)"]
        UC_ProviderReport["Báo cáo doanh thu & Xuất Excel"]
        UC_ApproveProfile["Phê duyệt hồ sơ nhà cung cấp"]
        UC_ManageUsers["Quản lý người dùng & Khóa tài khoản"]
        UC_ManageDestinations["Quản lý điểm đến (Ninh Bình, Hải Phòng)"]
        UC_ManageArticles["Quản lý bài viết cẩm nang"]
        UC_SystemConfig["Cấu hình tham số hệ thống & Hoa hồng"]
        UC_AdminReport["Báo cáo & Thống kê toàn sàn"]
        UC_AutoPurge["Tự động dọn dẹp dịch vụ quá hạn"]
    end

    Guest --- UC_Auth
    Guest --- UC_Search
    Guest --- UC_ViewDetail
    Guest --- UC_ChatAI
    Guest --- UC_TripPlan

    Customer --- UC_Booking
    Customer --- UC_CancelRefund
    Customer --- UC_ManageOrder
    Customer --- UC_Review

    Provider --- UC_Auth
    Provider --- UC_ProviderProfile
    Provider --- UC_ManageServices
    Provider --- UC_ProcessOrder
    Provider --- UC_ProviderReport

    Admin --- UC_ApproveProfile
    Admin --- UC_ManageUsers
    Admin --- UC_ManageDestinations
    Admin --- UC_ManageArticles
    Admin --- UC_SystemConfig
    Admin --- UC_AdminReport

    UC_Booking -.->|Include| UC_Payment
    UC_ProcessOrder -.->|Include| UC_ProviderPayout

    UC_Payment --- PayPal
    UC_CancelRefund --- PayPal
    UC_ProviderPayout --- PayPal
    UC_ChatAI --- AI
    UC_TripPlan --- AI
    Cron --- UC_AutoPurge
```

---

### 2.2.3. Phân rã Use Case theo từng phân hệ

#### A. Phân hệ Khách vãng lai và Khách hàng

```mermaid
flowchart LR
    Guest["Khách vãng lai"]
    Customer["Khách hàng"]
    PayPal["PayPal"]
    AI["AI & Google Maps"]

    Customer -.->|Kế thừa| Guest

    subgraph CustomerSubsystem ["PHÂN HỆ KHÁCH HÀNG"]
        direction TB
        G1["Đăng ký tài khoản"]
        G2["Đăng nhập hệ thống"]
        G3["Xem cẩm nang du lịch"]
        G4["Khám phá dịch vụ (Lọc tỉnh, thẻ, giá)"]
        G5["Tìm kiếm ngữ nghĩa (Semantic Search)"]
        G6["Xem chi tiết dịch vụ & bản đồ Leaflet"]
        G7["Chat với Trợ lý AI (Roamly Chat)"]
        G8["Lập lịch trình tự động (AI Trip Planner)"]

        C1["Đặt tour theo lịch khởi hành"]
        C2["Đặt phòng khách sạn"]
        C3["Đặt bàn nhà hàng theo khung giờ"]
        C4["Thanh toán trực tuyến qua PayPal"]
        C5["Hủy đơn đặt chỗ"]
        C6["Nhận tiền hoàn qua PayPal Refund"]
        C7["Xem lịch sử đơn & Chi tiết hóa đơn"]
        C8["Viết đánh giá & Chấm điểm sao"]
        C9["Quản lý hồ sơ cá nhân"]
    end

    Guest --- G1
    Guest --- G2
    Guest --- G3
    Guest --- G4
    Guest --- G6
    Guest --- G7
    Guest --- G8

    Customer --- C1
    Customer --- C2
    Customer --- C3
    Customer --- C5
    Customer --- C7
    Customer --- C8
    Customer --- C9

    G4 -.->|Include| G5
    G7 -.->|Extend| G8
    C1 -.->|Include| C4
    C2 -.->|Include| C4
    C5 -.->|Extend| C6

    C4 --- PayPal
    C6 --- PayPal
    G7 --- AI
    G8 --- AI
```

#### B. Phân hệ Nhà cung cấp dịch vụ

```mermaid
flowchart LR
    Provider["Nhà cung cấp"]
    PayPal["PayPal"]

    subgraph ProviderSubsystem ["PHÂN HỆ NHÀ CUNG CẤP"]
        direction TB
        P1["Đăng ký / Đăng nhập đối tác"]
        P2["Tạo hồ sơ doanh nghiệp"]
        P3["Liên kết tài khoản PayPal nhận tiền"]
        P4["Tạo chữ ký số trên hóa đơn"]
        P5["Gửi hồ sơ chờ Quản trị viên duyệt"]
        P6["Quản lý tour & Lịch khởi hành"]
        P7["Quản lý khách sạn & Loại phòng"]
        P8["Quản lý nhà hàng & Khung giờ phục vụ"]
        P9["Tạm dừng / Đóng dịch vụ"]
        P10["Xác nhận đơn đặt bàn"]
        P11["Hủy đơn đặt & Kích hoạt hoàn tiền"]
        P12["Đánh dấu hoàn thành đơn dịch vụ"]
        P13["Tự động nhận chi trả doanh thu (Payout)"]
        P14["Theo dõi lịch đặt chỗ (Calendar View)"]
        P15["Xem danh sách đánh giá của khách"]
        P16["Báo cáo doanh thu & Xuất dữ liệu Excel"]
    end

    Provider --- P1
    Provider --- P2
    Provider --- P4
    Provider --- P6
    Provider --- P7
    Provider --- P8
    Provider --- P9
    Provider --- P10
    Provider --- P11
    Provider --- P12
    Provider --- P14
    Provider --- P15
    Provider --- P16

    P2 -.->|Include| P3
    P2 -.->|Include| P5
    P12 -.->|Include| P13

    P3 --- PayPal
    P11 --- PayPal
    P13 --- PayPal
```

#### C. Phân hệ Quản trị viên

```mermaid
flowchart LR
    Admin["Quản trị viên"]
    Cron["Vercel Cron"]

    subgraph AdminSubsystem ["PHÂN HỆ QUẢN TRỊ VIÊN"]
        direction TB
        A1["Đăng nhập quản trị"]
        A2["Xem bảng điều khiển tổng quan (Dashboard)"]
        A3["Thẩm định & Phê duyệt hồ sơ đối tác"]
        A4["Quản lý danh sách người dùng"]
        A5["Khóa / Mở khóa tài khoản người dùng"]
        A6["Quản lý điểm đến (Ninh Bình & Hải Phòng)"]
        A7["Soạn thảo cẩm nang du lịch (Rich Text Editor)"]
        A8["Cấu hình hoa hồng sàn & Tham số hệ thống"]
        A9["Báo cáo doanh thu sàn & Xuất dữ liệu Excel"]
        A10["Kiểm duyệt đánh giá vi phạm"]
        S1["Tự động xóa mềm dịch vụ tạm dừng quá hạn"]
    end

    Admin --- A1
    Admin --- A2
    Admin --- A3
    Admin --- A4
    Admin --- A6
    Admin --- A7
    Admin --- A8
    Admin --- A9
    Admin --- A10

    A4 -.->|Extend| A5
    Cron --- S1
```

---

### 2.2.4. Ma trận phân quyền người dùng (RBAC Matrix)

Nhằm đảm bảo an toàn dữ liệu và tuân thủ nguyên tắc đặc quyền tối thiểu, hệ thống áp dụng cơ chế phân quyền kiểm soát truy cập dựa trên vai trò (RBAC):

| Phân hệ / Tài nguyên chức năng | Khách vãng lai | Khách hàng (Customer) | Nhà cung cấp (Provider) | Quản trị viên (Admin) |
|---|:---:|:---:|:---:|:---:|
| **Xem dịch vụ, điểm đến, cẩm nang** | Xem (Read) | Xem (Read) | Xem (Read) | Quản trị toàn quyền |
| **Tìm kiếm ngữ nghĩa & Chat AI** | Thực thi (Execute) | Thực thi (Execute) | Thực thi (Execute) | Thực thi & Giám sát |
| **Lập lịch trình bằng AI (Trip Planner)** | Thực thi (Execute) | Thực thi (Execute) | Thực thi (Execute) | Thực thi (Execute) |
| **Đặt chỗ (Tour/Phòng/Bàn)** | Không | Tạo mới (Create) | Không | Xem & Giám sát |
| **Thanh toán trực tuyến & Hủy đơn** | Không | Thực thi (Execute) | Không | Xem & Giám sát |
| **Xem & in hóa đơn điện tử** | Không | Đơn của bản thân | Đơn của cơ sở mình | Xem tất cả hóa đơn |
| **Viết đánh giá dịch vụ** | Không | Đơn đã hoàn thành | Phản hồi đánh giá | Kiểm duyệt & Ẩn/Xóa |
| **Quản trị dịch vụ (Đăng/Sửa/Đóng)** | Không | Không | Dịch vụ của bản thân | Kiểm duyệt & Xóa mềm |
| **Xác nhận bàn & Hoàn thành đơn** | Không | Không | Đơn của cơ sở mình | Can thiệp khi tranh chấp |
| **Phê duyệt hồ sơ đối tác kinh doanh** | Không | Không | Tạo & Gửi duyệt | Toàn quyền phê duyệt |
| **Quản trị người dùng & Khóa tài khoản** | Không | Không | Không | Toàn quyền kiểm soát |
| **Cấu hình tham số sàn & Hoa hồng** | Không | Không | Không | Toàn quyền cấu hình |

---

### 2.2.5. Biểu đồ luồng trải nghiệm người dùng tổng thể (User Journey Flow)

```mermaid
flowchart TD
    Start([Truy cập Roamly]) --> Home[Trang chủ & Khám phá]
    Home --> Choice{Lựa chọn trải nghiệm}

    Choice -->|Tìm kiếm dịch vụ| Explore[Lọc theo Ninh Bình / Hải Phòng / Giá / Thẻ]
    Choice -->|Tư vấn trực tiếp| ChatAI[Trò chuyện cùng Roamly AI]
    Choice -->|Lên kế hoạch chuyến đi| TripPlan[Công cụ AI Trip Planner]

    ChatAI -->|AI gợi ý thẻ dịch vụ| Detail[Trang chi tiết dịch vụ]
    TripPlan -->|Lịch trình tối ưu lộ trình| Detail
    Explore --> Detail

    Detail --> BookBtn{Chọn Đặt chỗ}
    BookBtn --> AuthCheck{Đã đăng nhập?}
    AuthCheck -- Chưa --> Login[Đăng nhập / Đăng ký tài khoản] --> Form[Điền thông tin đặt chỗ]
    AuthCheck -- Rồi --> Form

    Form --> ServiceKind{Loại hình dịch vụ}
    
    ServiceKind -- Nhà hàng ẩm thực --> TableBooking[Tạo đơn chờ xác nhận]
    TableBooking --> ProviderConfirm{Nhà hàng xác nhận?}
    ProviderConfirm -- Đồng ý --> ConfirmedTable[Đơn được xác nhận] --> Dining[Đến dùng bữa]
    ProviderConfirm -- Từ chối --> CancelledTable([Đơn bị hủy])

    ServiceKind -- Tour / Khách sạn --> LockSlot[Khóa chỗ tạm thời trong N phút]
    LockSlot --> PayPalGateway[Cổng thanh toán PayPal]
    PayPalGateway --> PayStatus{Kết quả thanh toán}
    PayStatus -- Thất bại / Quá hạn --> ExpiredSlot([Hủy đơn, trả lại chỗ])
    PayStatus -- Thành công --> PaidOrder[Đơn đã thanh toán - Tiền ký quỹ]

    PaidOrder --> ServiceUsage[Du khách trải nghiệm dịch vụ]
    ServiceUsage --> ProviderDone[Nhà cung cấp đánh dấu hoàn thành]
    ProviderDone --> PayoutTrigger[PayPal Payouts tự động chuyển tiền đối tác]
    ProviderDone --> ReviewLeave[Khách hàng viết đánh giá có AI kiểm duyệt]
```

---

## 2.3. Đặc tả chức năng chi tiết

### 2.3.1. Đặc tả các Use Case thuộc phân hệ Khách hàng

#### UC-01: Tìm kiếm và khám phá dịch vụ thông minh
- **Mã Use Case:** UC-01
- **Tác nhân:** Khách vãng lai, Khách hàng.
- **Mục đích:** Hỗ trợ người dùng tra cứu tour, khách sạn, nhà hàng tại Ninh Bình và Hải Phòng thông qua bộ lọc đa thuộc tính hoặc tìm kiếm bằng ngôn ngữ tự nhiên.
- **Tiền điều kiện:** Người dùng truy cập trang Khám phá (`/explore`).
- **Luồng sự kiện chính:**
  1. Người dùng chọn tab loại dịch vụ mong muốn (Tour, Khách sạn, Nhà hàng).
  2. Người dùng chọn địa bàn (Ninh Bình hoặc Hải Phòng), chọn khoảng giá, số sao đánh giá hoặc các thẻ phong cách (nghỉ dưỡng, di sản, ẩm thực, biển đảo).
  3. Hoặc người dùng nhập câu mô tả tự nhiên vào thanh tìm kiếm (ví dụ: *"khách sạn view biển Cát Bà giá dưới 1 triệu"*).
  4. Hệ thống thực hiện nhúng câu hỏi thành vector đặc trưng và truy vấn cơ sở dữ liệu vector Pinecone kết hợp lọc thuộc tính trên PostgreSQL.
  5. Hệ thống hiển thị danh sách kết quả phù hợp kèm hình ảnh, mức giá, số sao và vị trí trên bản đồ Leaflet.
- **Luồng ngoại lệ:** Nếu không tìm thấy dịch vụ nào khớp hoàn toàn với câu hỏi ngữ nghĩa, hệ thống tự động mở rộng vùng tìm kiếm sang các điểm lân cận cùng tỉnh và đưa ra gợi ý liên quan.
- **Hậu điều kiện:** Người dùng có thể nhấp chọn dịch vụ để xem chi tiết.

#### UC-02: Trò chuyện và tư vấn với Trợ lý ảo AI (Roamly Chat)
- **Mã Use Case:** UC-02
- **Tác nhân:** Khách vãng lai, Khách hàng, Mô hình AI (Gemini 2.5 Flash trên Vertex AI), CSDL Vector Pinecone, Google Places API.
- **Mục đích:** Tư vấn dịch vụ du lịch, giải đáp thắc mắc và gợi ý địa điểm theo ngữ cảnh thời gian thực.
- **Tiền điều kiện:** Người dùng mở giao diện chat (`/chat`).
- **Luồng sự kiện chính:**
  1. Người dùng nhập câu hỏi hoặc yêu cầu tư vấn du lịch.
  2. Hệ thống chuyển tin nhắn đến mô hình ngôn ngữ lớn thông qua kiến trúc RAG.
  3. Mô hình phân tích ý định và kích hoạt các công cụ tương ứng:
     - Nếu hỏi về tour: Gọi công cụ `searchTours` để tra cứu trong cơ sở dữ liệu nội bộ qua Pinecone và PostgreSQL.
     - Nếu hỏi về địa điểm ăn uống, vui chơi lân cận: Gọi công cụ `searchPlaces` để tra cứu địa điểm thực tế từ Google Places API.
     - Nếu câu hỏi còn mơ hồ về địa danh: Kích hoạt công cụ `askUser` để hỏi lại du khách.
  4. Mô hình tổng hợp thông tin và phản hồi dạng dòng (Streaming Response).
  5. Giao diện hiển thị văn bản trả lời đính kèm các thẻ dịch vụ động (UI Cards) có nút xem chi tiết và đặt chỗ ngay.
- **Luồng ngoại lệ:** Nếu kết nối tới mạng đám mây Vertex AI bị gián đoạn, hệ thống thông báo lỗi thân thiện và gợi ý người dùng sử dụng bộ lọc tìm kiếm truyền thống.
- **Hậu điều kiện:** Người dùng nhận được câu trả lời chính xác, được neo với dữ liệu thực tế và có thể tương tác tiếp.

#### UC-03: Lập kế hoạch du lịch bằng AI (AI Trip Planner)
- **Mã Use Case:** UC-03
- **Tác nhân:** Khách vãng lai, Khách hàng, Mô hình AI, Google Routes API.
- **Mục đích:** Tự động thiết kế lịch trình du lịch cá nhân hóa nhiều ngày tại Ninh Bình hoặc Hải Phòng và tối ưu hóa tuyến đường di chuyển thực tế.
- **Tiền điều kiện:** Người dùng truy cập phân hệ Lập kế hoạch (`/trip-planner`).
- **Luồng sự kiện chính:**
  1. Người dùng cung cấp các thông tin đầu vào: Điểm đến (Ninh Bình hoặc Hải Phòng), số lượng ngày, ngân sách dự kiến, thành phần đoàn đi và sở thích trải nghiệm.
  2. Mô hình AI phân tích dữ liệu, lựa chọn các điểm tham quan phù hợp và phân chia khoa học vào các khung giờ: Sáng, Trưa, Chiều, Tối của từng ngày.
  3. Hệ thống gửi tọa độ các điểm dừng chân liên tiếp tới Google Routes API để tính toán ma trận khoảng cách vật lý (km) và thời gian di chuyển dự kiến.
  4. Hệ thống kết xuất lịch trình chi tiết theo từng ngày, trực quan hóa toàn bộ lộ trình di chuyển (polyline) trên bản đồ tương tác.
- **Luồng ngoại lệ:** Nếu điểm đến người dùng nhập nằm ngoài phạm vi 2 tỉnh Ninh Bình và Hải Phòng, hệ thống thông báo phạm vi dữ liệu hiện tại và gợi ý lịch trình khám phá một trong hai địa phương trên.
- **Hậu điều kiện:** Lịch trình được lưu lại trên trình duyệt của người dùng; người dùng có thể tùy chỉnh hoặc liên kết đặt các dịch vụ xuất hiện trong lịch trình.

#### UC-04: Đặt chỗ và thanh toán ký quỹ qua PayPal
- **Mã Use Case:** UC-04
- **Tác nhân:** Khách hàng, Hệ thống PayPal.
- **Mục đích:** Thực hiện quy trình đặt tour, phòng khách sạn và thanh toán trực tuyến ký quỹ an toàn.
- **Tiền điều kiện:** Khách hàng đã đăng nhập; dịch vụ còn chỗ trống/phòng trống khả dụng.
- **Luồng sự kiện chính:**
  1. Khách hàng chọn ngày khởi hành (đối với Tour) hoặc ngày check-in/check-out (đối với Khách sạn), chọn số lượng vé hoặc loại phòng.
  2. Khách hàng nhập thông tin liên hệ và nhấn "Tiến hành đặt chỗ".
  3. Hệ thống tạo bản ghi đơn đặt ở trạng thái chờ thanh toán (`pending_payment`) và tạm khóa số lượng chỗ/phòng trong khoảng thời gian quy định (`bookingHoldMinutes`).
  4. Hệ thống tự động quy đổi giá trị đơn hàng từ Việt Nam Đồng sang Đô la Mỹ theo tỷ giá niêm yết và khởi tạo giao dịch qua PayPal Orders API.
  5. Khách hàng đăng nhập ví PayPal hoặc sử dụng thẻ thanh toán quốc tế để xác thực giao dịch trên cổng PayPal an toàn.
  6. Sau khi thanh toán thành công, PayPal gửi tín hiệu xác nhận về hệ thống. Hệ thống chuyển trạng thái đơn hàng sang Đã thanh toán (`paid`), tạo bản ghi thanh toán và cấp mã hóa đơn điện tử cho khách hàng.
- **Luồng ngoại lệ:** Nếu khách hàng không hoàn tất thanh toán trong thời gian giữ chỗ (`bookingHoldMinutes`), hệ thống tự động hủy đơn và giải phóng số lượng chỗ/phòng về trạng thái sẵn sàng cho người khác đặt.
- **Hậu điều kiện:** Đơn hàng được xác nhận thanh toán; tiền được lưu giữ an toàn tại tài khoản ký quỹ của sàn.

#### UC-05: Hủy đơn và nhận hoàn tiền tự động qua PayPal Refund
- **Mã Use Case:** UC-05
- **Tác nhân:** Khách hàng, Hệ thống PayPal.
- **Mục đích:** Cho phép khách hàng hủy đơn đã thanh toán và nhận lại tiền hoàn tự động nếu đáp ứng chính sách hủy.
- **Tiền điều kiện:** Đơn hàng ở trạng thái `paid` hoặc `confirmed`; thời điểm yêu cầu hủy phải trước thời hạn hủy tối thiểu do nhà cung cấp quy định.
- **Luồng sự kiện chính:**
  1. Khách hàng truy cập danh sách đơn đặt cá nhân (`/my-bookings`), chọn đơn hàng cần hủy và chọn "Yêu cầu hủy đơn".
  2. Hệ thống kiểm tra điều kiện thời gian hủy so với thời điểm diễn ra dịch vụ.
  3. Nếu hợp lệ, hệ thống cập nhật trạng thái đơn thành Đã hủy (`cancelled`).
  4. Hệ thống kích hoạt PayPal Refund API với mã giao dịch tương ứng để hoàn trả 100% số tiền về tài khoản PayPal của khách hàng.
  5. Hệ thống hoàn trả lại số chỗ/phòng trống vào quỹ dịch vụ của nhà cung cấp.
- **Luồng ngoại lệ:** Nếu yêu cầu hủy đơn rơi vào khoảng thời gian cận kề ngày khởi hành (vượt quá thời hạn cho phép hủy), hệ thống từ chối hoàn tiền và thông báo lý do theo đúng quy chế đặt chỗ.
- **Hậu điều kiện:** Khách hàng nhận lại tiền hoàn; đơn chuyển trạng thái hủy hoàn tất.

#### UC-06: Đánh giá dịch vụ và kiểm duyệt tự động
- **Mã Use Case:** UC-06
- **Tác nhân:** Khách hàng, Mô hình AI kiểm duyệt.
- **Mục đích:** Gửi nhận xét và xếp hạng chất lượng sau khi đã sử dụng dịch vụ thực tế.
- **Tiền điều kiện:** Khách hàng sở hữu đơn hàng đã chuyển sang trạng thái Hoàn thành (`completed`) và chưa từng đánh giá đơn hàng đó.
- **Luồng sự kiện chính:**
  1. Khách hàng chọn số sao đánh giá (từ 1 đến 5 sao) và viết nội dung phản hồi trải nghiệm.
  2. Khi nhấn gửi, hệ thống kích hoạt mô hình ngôn ngữ lớn phân tích ngữ nghĩa nội dung:
     - Kiểm tra từ ngữ thô tục, xúc phạm hoặc kích động thù địch.
     - Phát hiện các đường liên kết quảng cáo rác (spam links) hoặc nội dung không liên quan đến dịch vụ.
  3. Nếu nội dung trong sạch: Hệ thống lưu đánh giá, tự động tính toán lại điểm đánh giá trung bình (`ratingAvg`) và số lượt đánh giá (`reviewCount`) của dịch vụ.
  4. Nếu nội dung nghi vấn vi phạm: Đánh giá được lưu nhưng tự động gắn cờ cảnh báo (`isFlagged = true`) và ẩn khỏi trang chi tiết cho đến khi Quản trị viên thẩm định.
- **Hậu điều kiện:** Đánh giá hợp lệ được hiển thị công khai trên trang chi tiết dịch vụ.

---

### 2.3.2. Đặc tả các Use Case thuộc phân hệ Nhà cung cấp

#### UC-07: Đăng ký hồ sơ doanh nghiệp và liên kết PayPal Payout
- **Mã Use Case:** UC-07
- **Tác nhân:** Nhà cung cấp, Quản trị viên, Hệ thống PayPal.
- **Mục đích:** Thiết lập hồ sơ pháp lý đối tác kinh doanh và tài khoản nhận tiền doanh thu tự động.
- **Tiền điều kiện:** Nhà cung cấp đã đăng ký tài khoản với vai trò `provider`.
- **Luồng sự kiện chính:**
  1. Nhà cung cấp điền thông tin doanh nghiệp/cơ sở kinh doanh: Tên thương hiệu, mã số thuế/giấy phép kinh doanh, số điện thoại, địa chỉ hoạt động tại Ninh Bình hoặc Hải Phòng.
  2. Nhà cung cấp nhập địa chỉ email tài khoản PayPal hợp lệ dùng để nhận tiền giải ngân doanh thu.
  3. Nhà cung cấp sử dụng bảng vẽ chữ ký số (Signature Pad) để tạo chữ ký điện tử sẽ xuất hiện trên hóa đơn thanh toán gửi khách hàng.
  4. Nhà cung cấp nhấn "Gửi hồ sơ thẩm định". Hồ sơ chuyển sang trạng thái Chờ duyệt (`pending`).
- **Luồng ngoại lệ:** Nếu email PayPal không đúng định dạng hoặc trùng lặp với tài khoản đối tác khác, hệ thống cảnh báo và yêu cầu chỉnh sửa trước khi gửi duyệt.
- **Hậu điều kiện:** Hồ sơ được gửi lên danh sách chờ Quản trị viên xét duyệt.

#### UC-08: Quản lý danh mục dịch vụ (Tour, Khách sạn, Nhà hàng)
- **Mã Use Case:** UC-08
- **Tác nhân:** Nhà cung cấp.
- **Mục đích:** Đăng ký mới, chỉnh sửa thông tin hoặc tạm dừng kinh doanh các sản phẩm dịch vụ du lịch.
- **Tiền điều kiện:** Hồ sơ nhà cung cấp đã được Quản trị viên phê duyệt (`approved`).
- **Luồng sự kiện chính:**
  1. Nhà cung cấp chọn loại hình dịch vụ muốn quản lý: Tour du lịch, Khách sạn, hoặc Nhà hàng ẩm thực.
  2. Nhập các thông tin chi tiết: Tên dịch vụ, mô tả nổi bật, địa chỉ chính xác, tải lên hình ảnh chất lượng cao thông qua mạng phân phối nội dung CDN ImageKit.
  3. Cấu hình các thuộc tính nghiệp vụ đặc thù:
     - Đối với Tour: Thiết lập lịch khởi hành theo ngày, số lượng khách tối đa cho mỗi chuyến, giá vé người lớn và giá vé trẻ em.
     - Đối với Khách sạn: Thiết lập danh sách các loại phòng, diện tích, tiện ích đi kèm, sức chứa và đơn giá theo đêm.
     - Đối với Nhà hàng: Thiết lập các khung giờ phục vụ trong ngày (ví dụ: ca trưa 11:00–13:00, ca tối 18:00–20:00) và sức chứa tối đa theo từng ca.
  4. Hệ thống lưu trữ dữ liệu vào PostgreSQL và đồng bộ dữ liệu văn bản mô tả sang Pinecone Vector Database phục vụ tìm kiếm ngữ nghĩa.
- **Luồng ngoại lệ:** Nếu nhà cung cấp tạm dừng một dịch vụ mà vẫn còn các đơn đặt chỗ chưa diễn ra trong tương lai, hệ thống yêu cầu tiếp tục phục vụ các đơn đã thanh toán trước khi đóng hoàn toàn dịch vụ.
- **Hậu điều kiện:** Dịch vụ được công bố trực tuyến trên sàn để du khách tìm kiếm và đặt chỗ.

#### UC-09: Xử lý đơn đặt và tự động nhận doanh thu qua PayPal Payouts
- **Mã Use Case:** UC-09
- **Tác nhân:** Nhà cung cấp, Hệ thống PayPal.
- **Mục đích:** Quản lý vòng đời đơn đặt và nhận tiền quyết toán doanh thu tự động vào ví PayPal.
- **Tiền điều kiện:** Có đơn đặt dịch vụ của khách hàng.
- **Luồng sự kiện chính:**
  1. Đối với dịch vụ đặt bàn nhà hàng: Nhà cung cấp xem thông tin đơn (`pending_confirmation`), kiểm tra sức chứa và nhấn "Xác nhận" (`confirmed`) hoặc "Từ chối" (`cancelled`).
  2. Đối với đơn tour hoặc khách sạn đã thanh toán (`paid`): Nhà cung cấp kiểm tra lịch phục vụ và đón tiếp khách hàng vào ngày hẹn.
  3. Sau khi du khách đã sử dụng xong dịch vụ, nhà cung cấp truy cập chi tiết đơn hàng và nhấn "Đánh dấu hoàn thành" (`completed`).
  4. Hệ thống tự động tính toán số tiền thực nhận của nhà cung cấp:  
     $$\text{Doanh thu thực nhận} = \text{Tổng tiền đơn hàng} \times (1 - \text{Tỷ lệ hoa hồng sàn})$$
  5. Hệ thống tự động kích hoạt lệnh giao dịch qua **PayPal Payouts API**, chuyển thẳng số tiền thực nhận từ tài khoản sàn về tài khoản PayPal mà nhà cung cấp đã liên kết.
  6. Hệ thống cập nhật trạng thái chi trả thành công và lưu vết mã giao dịch Payout vào hóa đơn điện tử.
- **Luồng ngoại lệ:** Nếu tài khoản PayPal của đối tác bị giới hạn nhận tiền hoặc lỗi kết nối mạng từ phía PayPal, hệ thống ghi nhận lỗi vào nhật ký giao dịch và tạo tác vụ thử lại tự động (retry job) đồng thời thông báo cho Quản trị viên.
- **Hậu điều kiện:** Nhà cung cấp nhận tiền trực tiếp về tài khoản PayPal mà không cần phải thực hiện đối soát thủ công.

---

### 2.3.3. Đặc tả các Use Case thuộc phân hệ Quản trị viên

#### UC-10: Thẩm định và phê duyệt hồ sơ đối tác
- **Mã Use Case:** UC-10
- **Tác nhân:** Quản trị viên.
- **Mục đích:** Kiểm tra tính hợp pháp của các đơn vị cung cấp dịch vụ trước khi cho phép hoạt động kinh doanh trên hệ thống.
- **Tiền điều kiện:** Quản trị viên đăng nhập vào trang quản trị (`/admin/profile-approval`); có hồ sơ đối tác ở trạng thái `pending`.
- **Luồng sự kiện chính:**
  1. Quản trị viên xem danh sách các hồ sơ đối tác đang chờ duyệt.
  2. Nhấp chọn xem chi tiết từng hồ sơ: Thông tin pháp lý, giấy phép kinh doanh, số điện thoại, địa chỉ cơ sở tại Ninh Bình hoặc Hải Phòng, tài khoản PayPal liên kết và mẫu chữ ký số.
  3. Nếu hồ sơ đầy đủ và hợp lệ: Quản trị viên nhấn "Phê duyệt" (`approved`). Nhà cung cấp nhận được thông báo và được cấp quyền tạo dịch vụ.
  4. Nếu hồ sơ thiếu thông tin hoặc không đạt yêu cầu: Quản trị viên nhấn "Từ chối" (`rejected`), nhập rõ lý do để nhà cung cấp chỉnh sửa và nộp lại.
- **Hậu điều kiện:** Trạng thái hồ sơ đối tác được cập nhật chính xác trên toàn hệ thống.

#### UC-11: Quản trị điểm đến và bài viết cẩm nang du lịch
- **Mã Use Case:** UC-11
- **Tác nhân:** Quản trị viên.
- **Mục đích:** Quản lý thông tin danh thắng tại Ninh Bình, Hải Phòng và xuất bản các bài viết hướng dẫn du lịch chất lượng cao.
- **Tiền điều kiện:** Quản trị viên đăng nhập hệ thống (`/admin/destinations` và `/admin/articles`).
- **Luồng sự kiện chính:**
  1. *Quản trị điểm đến:* Quản trị viên thêm mới hoặc cập nhật các điểm đến trọng điểm (Tràng An, Bái Đính, Tam Cốc, Cát Bà, Lan Hạ, Đồ Sơn...), cấu hình tọa độ địa lý (vĩ độ, kinh độ), hình ảnh đại diện và mô tả lịch sử/văn hóa.
  2. *Soạn thảo bài viết cẩm nang:* Quản trị viên sử dụng trình soạn thảo Rich Text đa năng (Tiptap) để viết bài cẩm nang (kinh nghiệm đi Food Tour Hải Phòng, kinh nghiệm đi thuyền Tràng An...), hỗ trợ định dạng văn bản nâng cao, nhúng video, chèn hình ảnh trực tiếp lên hệ thống lưu trữ đám mây CDN ImageKit.
  3. Quản trị viên thiết lập trạng thái bài viết: Bản nháp (`draft`) hoặc Xuất bản công khai (`published`).
  4. Quản lý bình luận của bạn đọc: Rà soát, ẩn hoặc xóa các bình luận chứa nội dung không phù hợp dưới các bài viết.
- **Hậu điều kiện:** Điểm đến và các bài viết cẩm nang được hiển thị trực quan trên giao diện dành cho khách hàng.

#### UC-12: Cấu hình tham số sàn và báo cáo thống kê trực quan
- **Mã Use Case:** UC-12
- **Tác nhân:** Quản trị viên.
- **Mục đích:** Điều phối các chính sách vận hành của sàn và theo dõi hiệu quả kinh doanh thông qua số liệu trực quan.
- **Tiền điều kiện:** Quản trị viên truy cập trang Cấu hình (`/admin/settings`) và Báo cáo (`/admin/reports`).
- **Luồng sự kiện chính:**
  1. *Cấu hình hệ thống:* Quản trị viên điều chỉnh tỷ lệ hoa hồng sàn (`PLATFORM_COMMISSION_RATE`, ví dụ: 10%), thời gian khóa chỗ tạm thời (`bookingHoldMinutes`, ví dụ: 15 phút), thời hạn hủy đơn tối thiểu trước ngày sử dụng, và tỷ giá quy đổi ngoại tệ phục vụ cổng PayPal.
  2. *Theo dõi biểu đồ thống kê:* Quản trị viên theo dõi Dashboard với các biểu đồ trực quan hóa (ApexCharts): Tổng giá trị giao dịch hàng hóa (GMV), Doanh thu tiền hoa hồng thực nhận của sàn, Tỷ lệ đơn đặt theo từng loại hình dịch vụ (Tour/Khách sạn/Nhà hàng), và Số lượng người dùng mới theo tháng.
  3. *Xuất báo cáo dữ liệu:* Quản trị viên chọn khoảng thời gian và nhấn nút xuất báo cáo. Hệ thống biên dịch và tải xuống tập tin bảng tính định dạng chuẩn Microsoft Excel (`.xlsx`) chứa đầy đủ chi tiết các giao dịch.
- **Hậu điều kiện:** Các thiết lập vận hành có hiệu lực tức thì; báo cáo tài chính được kết xuất chính xác phục vụ công tác quản trị.

---

## 2.4. Phân tích yêu cầu phi chức năng

Nhằm đảm bảo hệ thống vận hành ổn định, an toàn và mang lại trải nghiệm tối ưu cho người dùng trên môi trường mạng Internet, đồ án xác định các yêu cầu phi chức năng cốt lõi sau:

### 2.4.1. Yêu cầu về hiệu năng và thời gian đáp ứng (Performance & Latency)
- **Tốc độ tải trang:** Các trang tĩnh và trang danh mục sử dụng cơ chế Server-Side Rendering (SSR) kết hợp Incremental Static Regeneration (ISR) phải đạt thời gian phản hồi máy chủ đầu tiên (Time to First Byte – TTFB) dưới 300ms và hiển thị nội dung có ý nghĩa đầu tiên (First Contentful Paint – FCP) dưới 1.2 giây trên đường truyền mạng tiêu chuẩn.
- **Thời gian phản hồi của Trí tuệ nhân tạo (AI Streaming):** Nhờ cơ chế truyền phát dữ liệu dạng dòng (Stream Response) của Vercel AI SDK, ký tự đầu tiên của câu trả lời từ trợ lý ảo AI phải xuất hiện trên giao diện người dùng trong vòng dưới 800ms kể từ khi gửi tin nhắn.
- **Thời gian truy vấn vector:** Tốc độ tìm kiếm độ tương đồng vector trên cơ sở dữ liệu Pinecone đối với dữ liệu dịch vụ phải hoàn thành trong thời gian dưới 200ms.

### 2.4.2. Yêu cầu về an toàn và bảo mật thông tin (Security)
- **Bảo mật xác thực và phân quyền:** Sử dụng mã hóa JSON Web Token (JWT) kết hợp cơ chế kiểm soát phiên làm việc an toàn của Auth.js. Mật khẩu tài khoản người dùng được băm một chiều bằng thuật toán Bcrypt với độ phức tạp cao (Salt rounds = 10), tuyệt đối không lưu mật khẩu dạng văn bản thuần (plain text).
- **Bảo vệ chống tấn công web phổ biến:** Toàn bộ dữ liệu đầu vào qua Server Actions được kiểm tra nghiêm ngặt thông qua thư viện Zod Schema, ngăn chặn triệt để các lỗ hổng Injection (SQL Injection, Cross-Site Scripting – XSS) và Cross-Site Request Forgery (CSRF).
- **Bảo mật giao dịch tài chính:** Tuyệt đối không lưu trữ thông tin thẻ tín dụng của khách hàng trên máy chủ của hệ thống; toàn bộ quá trình xác thực và thanh toán được ủy thác cho cổng bảo mật chuẩn quốc tế của PayPal. Mọi thông tin liên lạc giữa người dùng và máy chủ đều được mã hóa bằng giao thức HTTPS với chứng chỉ SSL/TLS tiêu chuẩn.

### 2.4.3. Yêu cầu về tính khả dụng và độ tin cậy (Availability & Reliability)
- **Tính sẵn sàng của dịch vụ:** Hệ thống được thiết kế hướng tới khả năng phục vụ liên tục 24/7 trên hạ tầng máy chủ biên (Edge Network) của Vercel và hệ thống cơ sở dữ liệu đám mây PostgreSQL.
- **Khả năng chịu lỗi và tự phục hồi:** Áp dụng nguyên lý xử lý trùng lặp (Idempotency) đối với các sự kiện webhook từ cổng thanh toán PayPal, ngăn chặn tình trạng xử lý lặp đơn hàng hoặc hoàn tiền nhiều lần do sự cố truyền thông mạng.
- **Cơ chế dọn dẹp dữ liệu tự động:** Tích hợp tiến trình định kỳ máy chủ (Vercel Cron Jobs) tự động rà soát và xóa mềm các dịch vụ đã tạm dừng kinh doanh quá thời hạn quy định (ví dụ: sau 30 ngày), đảm bảo kho dữ liệu luôn trong trạng thái tinh gọn và cập nhật.

### 2.4.4. Yêu cầu về giao diện và trải nghiệm người dùng (Usability & Responsiveness)
- **Khả năng đáp ứng đa thiết bị (Responsive Web Design):** Giao diện hệ thống được thiết kế linh hoạt, tự động tối ưu hóa bố cục hiển thị trên mọi kích thước màn hình phổ biến từ điện thoại thông minh (màn hình dọc từ 375px), máy tính bảng đến máy tính để bàn độ phân giải cao (Full HD, 2K, 4K).
- **Tính thân thiện và trực quan:** Sử dụng hệ thống thiết kế hiện đại với bảng màu hài hòa, hỗ trợ chế độ tương phản tốt, tích hợp các thành phần giao diện thông minh từ Tailwind CSS và shadcn/ui. Các biểu đồ thống kê được trực quan hóa sinh động bằng ApexCharts, giúp người dùng nắm bắt thông tin nhanh chóng và thuận tiện nhất.


---

# CHƯƠNG 3: CÔNG NGHỆ SỬ DỤNG

Chương này trình bày các công nghệ, nền tảng và dịch vụ được lựa chọn để hiện thực hóa hệ thống Roamly. Với mỗi công nghệ, báo cáo nêu khái quát đặc điểm, lý do lựa chọn so với các phương án thay thế và vai trò cụ thể của công nghệ đó trong hệ thống. Các công nghệ được tổ chức theo năm nhóm: (1) nền tảng phát triển ứng dụng web; (2) giao diện người dùng; (3) lưu trữ và quản lý dữ liệu; (4) Trí tuệ nhân tạo; (5) dịch vụ tích hợp bên ngoài, triển khai và giám sát.

## 3.1. Tổng quan kiến trúc công nghệ

Hệ thống được xây dựng theo mô hình ứng dụng Full-stack hợp nhất: cả giao diện người dùng lẫn logic nghiệp vụ phía máy chủ cùng nằm trong một dự án Next.js và được viết bằng một ngôn ngữ duy nhất là TypeScript. Cách tiếp cận này giúp chia sẻ kiểu dữ liệu và lược đồ kiểm tra dữ liệu (schema) giữa máy khách và máy chủ, giảm chi phí duy trì hai dự án tách biệt và rút ngắn thời gian phát triển — một yếu tố quan trọng trong khuôn khổ đồ án tốt nghiệp.

Bảng dưới đây tổng hợp toàn bộ ngăn xếp công nghệ (technology stack) của hệ thống:

| Nhóm | Công nghệ | Phiên bản | Vai trò chính |
|---|---|:---:|---|
| **Nền tảng** | Next.js (App Router, Server Actions) | 16.3 | Framework Full-stack: định tuyến, kết xuất giao diện, xử lý phía máy chủ |
| | React | 19.2 | Thư viện xây dựng giao diện theo thành phần (component) |
| | TypeScript | 5.x | Ngôn ngữ lập trình có kiểu tĩnh cho toàn bộ dự án |
| | Bun | 1.3 | Trình quản lý gói và môi trường chạy các tập lệnh (seed, embed dữ liệu) |
| **Giao diện** | Tailwind CSS | 4.x | Hệ thống định kiểu theo lớp tiện ích (utility-first) |
| | shadcn/ui, Base UI, Preline | — | Bộ thành phần giao diện dựng sẵn, hỗ trợ khả năng truy cập |
| | Leaflet | 1.9 | Hiển thị bản đồ tương tác, đánh dấu vị trí và vẽ lộ trình |
| | ApexCharts | 4.7 | Biểu đồ thống kê doanh thu, đơn hàng |
| | Tiptap | 3.x | Trình soạn thảo văn bản định dạng (rich text) cho bài viết |
| | Swiper, Motion, Lucide | — | Trình chiếu ảnh, hiệu ứng chuyển động, bộ biểu tượng |
| **Dữ liệu** | PostgreSQL | 16+ | Hệ quản trị CSDL quan hệ lưu dữ liệu nghiệp vụ |
| | Prisma ORM (`@prisma/adapter-pg`) | 7.10 | Ánh xạ đối tượng – CSDL, quản lý migration, truy vấn an toàn kiểu |
| | Pinecone | — | CSDL vector phục vụ tìm kiếm ngữ nghĩa và gợi ý |
| | Zod | 4.x | Định nghĩa và kiểm tra lược đồ dữ liệu đầu vào |
| **AI** | Vercel AI SDK (`ai`) | 7.x | Lớp trừu tượng gọi LLM: streaming, gọi công cụ, đầu ra có cấu trúc |
| | Google Gemini 3 Flash trên Vertex AI | preview | LLM cho chatbot, lập lịch trình và kiểm duyệt nội dung |
| | Gemini Embedding (`gemini-embedding-001`) | — | Mô hình nhúng văn bản thành vector 768 chiều |
| **Tích hợp** | Google Places API (New), Google Routes API | — | Dữ liệu địa điểm thực tế; quãng đường, thời gian và ma trận di chuyển |
| | PayPal REST API (Orders, Refunds, Payouts, Webhooks) | v2 | Thanh toán ký quỹ, hoàn tiền và chi trả doanh thu |
| | ImageKit | 6.x | Lưu trữ, tối ưu và phân phối hình ảnh qua CDN |
| | Auth.js (NextAuth v5) + bcryptjs | 5.0 beta | Xác thực người dùng, phiên JWT, băm mật khẩu |
| | ExcelJS | 4.4 | Xuất báo cáo định dạng `.xlsx` |
| **Vận hành** | Vercel (Hosting, Cron Jobs, OIDC) | — | Triển khai, tác vụ định kỳ, xác thực không dùng khóa tới Google Cloud |
| | Langfuse + OpenTelemetry | 6.1 | Giám sát, truy vết các lời gọi mô hình AI |

Về mặt tổ chức mã nguồn, dự án áp dụng cấu trúc phân tầng theo **thực thể – tính năng (Entity/Feature)**:

```
src/
├── app/        # Tầng định tuyến (App Router): trang giao diện và route handler API
├── features/   # Tầng tính năng theo vai trò: customer, provider, admin, trip-planner...
├── entities/   # Tầng thực thể: lược đồ Zod, kiểu dữ liệu, repository truy cập Prisma
├── shared/     # Thành phần giao diện và tiện ích dùng chung
└── lib/        # Client các dịch vụ ngoài: prisma, pinecone, vertex, paypal, google-routes...
```

Nguyên tắc phụ thuộc một chiều `app → features → entities → lib` giúp mỗi tầng chỉ biết tới tầng bên dưới, nhờ đó logic nghiệp vụ không bị trộn lẫn với mã giao diện và việc thay thế một dịch vụ bên ngoài (ví dụ đổi nhà cung cấp mô hình AI) chỉ ảnh hưởng tới tầng `lib`.

---

## 3.2. Nền tảng phát triển ứng dụng web

### 3.2.1. Next.js 16 và mô hình App Router

**Giới thiệu.** Next.js là framework mã nguồn mở do Vercel phát triển, xây dựng trên nền React, cho phép phát triển ứng dụng web Full-stack với khả năng kết xuất phía máy chủ (SSR), tạo trang tĩnh, tái tạo trang tĩnh gia tăng (ISR) và xử lý API trong cùng một dự án. Phiên bản 16 sử dụng mô hình định tuyến **App Router** dựa trên cấu trúc thư mục, trong đó mỗi thư mục trong `src/app` tương ứng với một đường dẫn URL.

**Các đặc điểm được khai thác trong hệ thống:**

- **React Server Components (RSC):** Mặc định mọi thành phần đều được kết xuất trên máy chủ. Các trang danh sách tour, khách sạn, chi tiết dịch vụ hay bài viết truy vấn trực tiếp CSDL thông qua Prisma ngay trong thành phần, trả về HTML hoàn chỉnh cho trình duyệt. Điều này giảm lượng JavaScript gửi xuống máy khách, tăng tốc độ hiển thị lần đầu và có lợi cho SEO — điều kiện quan trọng với một website du lịch cần được công cụ tìm kiếm lập chỉ mục.
- **Server Actions:** Các thao tác ghi dữ liệu (tạo đơn đặt chỗ, gửi đánh giá, duyệt hồ sơ nhà cung cấp, cập nhật cấu hình sàn...) được viết dưới dạng hàm bất đồng bộ đánh dấu `"use server"` và gọi trực tiếp từ biểu mẫu. Next.js tự động sinh điểm cuối HTTP, tích hợp sẵn cơ chế chống giả mạo yêu cầu (CSRF) và cho phép làm mới dữ liệu trang sau khi ghi (`revalidatePath`).
- **Route Handlers:** Với các luồng cần giao tiếp kiểu REST hoặc truyền phát dữ liệu, hệ thống định nghĩa các điểm cuối trong `src/app/api`: `/api/chat` và `/api/trip-chat` (truyền phát câu trả lời AI), `/api/trip-route` (tính lộ trình), `/api/paypal/webhooks` (nhận sự kiện thanh toán), `/api/cron/*` (tác vụ định kỳ), `/api/admin/reports` (xuất Excel).
- **Route Groups:** Các nhóm `(customer)`, `(account)`, `(auth)`, `(provider)`, `(admin)` cho phép mỗi phân hệ có bố cục (layout) riêng mà không ảnh hưởng tới URL.
- **Proxy (tiền thân là Middleware):** Tệp `src/proxy.ts` chặn mọi yêu cầu tới `/admin/*`, kiểm tra phiên đăng nhập và vai trò trước khi trang được kết xuất, chuyển hướng người dùng không có quyền về trang đăng nhập quản trị.
- **Hàm `after()`:** Cho phép thực thi công việc sau khi phản hồi đã gửi xong, được dùng để đẩy dữ liệu truy vết AI lên Langfuse mà không làm chậm câu trả lời của chatbot.

**Lý do lựa chọn.** So với mô hình tách biệt giao diện (React/Vue) và máy chủ (Express, Spring Boot), Next.js giảm đáng kể khối lượng mã kết nối (API client, cấu hình CORS, đồng bộ kiểu dữ liệu). Khả năng kết xuất phía máy chủ đáp ứng yêu cầu hiệu năng và SEO nêu ở mục 2.4.1, đồng thời Next.js được Vercel hỗ trợ triển khai tối ưu và hệ sinh thái AI (Vercel AI SDK) tích hợp tự nhiên.

### 3.2.2. React 19

React là thư viện JavaScript xây dựng giao diện theo mô hình thành phần và cơ chế cập nhật khai báo. Phiên bản 19 bổ sung các tính năng hệ thống tận dụng trực tiếp:

- **Server Components và Actions** là nền tảng cho App Router của Next.js nêu trên.
- **Hook `useActionState` và `useFormStatus`** quản lý trạng thái gửi biểu mẫu, hiển thị lỗi kiểm tra theo từng trường và trạng thái đang xử lý mà không cần thư viện quản lý biểu mẫu bên ngoài.
- **Hook `useOptimistic` và `useTransition`** giúp giao diện phản hồi tức thì (ví dụ đánh dấu đã đọc thông báo) trong khi thao tác thực sự đang được xử lý trên máy chủ.

### 3.2.3. TypeScript

TypeScript là tập mở rộng của JavaScript bổ sung hệ thống kiểu tĩnh, được biên dịch về JavaScript thuần. Trong hệ thống Roamly, TypeScript mang lại các lợi ích:

- **An toàn kiểu xuyên suốt từ CSDL tới giao diện:** Prisma sinh kiểu dữ liệu từ lược đồ CSDL; Zod suy ra kiểu từ lược đồ kiểm tra; Vercel AI SDK suy ra kiểu tham số và kết quả của từng công cụ AI (`InferUITools`). Nhờ đó, khi thay đổi một trường trong lược đồ, trình biên dịch chỉ ra ngay mọi vị trí mã bị ảnh hưởng.
- **Giảm lỗi khi chạy** đối với các luồng nghiệp vụ phức tạp như tính tiền đơn hàng, chuyển trạng thái đơn đặt hay quy đổi tiền tệ.

### 3.2.4. Bun

Bun là môi trường chạy JavaScript/TypeScript hiệu năng cao kiêm trình quản lý gói. Dự án dùng Bun để cài đặt thư viện và chạy trực tiếp các tập lệnh TypeScript không cần biên dịch trước: khởi tạo dữ liệu mẫu (`db:seed`), dọn dữ liệu (`db:clear`), và nhúng toàn bộ dữ liệu dịch vụ lên Pinecone (`db:embed`).

---

## 3.3. Công nghệ giao diện người dùng

### 3.3.1. Tailwind CSS 4

Tailwind CSS là framework định kiểu theo hướng **utility-first**: thay vì viết tệp định kiểu riêng, giao diện được dựng bằng cách kết hợp các lớp tiện ích nhỏ (`flex`, `gap-4`, `rounded-xl`, `md:grid-cols-3`...) trực tiếp trên phần tử. Phiên bản 4 có bộ máy biên dịch mới viết bằng Rust, cấu hình bằng CSS thuần (`@theme`) và tự động loại bỏ các lớp không dùng khi đóng gói.

Trong hệ thống, Tailwind CSS đảm nhiệm toàn bộ việc định kiểu, đặc biệt là thiết kế đáp ứng đa thiết bị (Responsive Web Design) thông qua các tiền tố điểm ngắt `sm:`, `md:`, `lg:`, đáp ứng yêu cầu hiển thị từ màn hình 375px tới màn hình độ phân giải cao (mục 2.4.4). Plugin `@tailwindcss/forms` chuẩn hóa giao diện các trường nhập liệu.

### 3.3.2. Bộ thành phần giao diện: shadcn/ui, Base UI và Preline

- **shadcn/ui** không phải là một thư viện cài đặt theo cách truyền thống mà là tập hợp mã nguồn các thành phần (Button, Dialog, Select, Table, Tabs...) được sao chép trực tiếp vào dự án (`src/components/ui`). Cách tiếp cận này cho phép tùy biến hoàn toàn giao diện theo nhận diện thương hiệu Roamly.
- **Base UI** cung cấp các thành phần "không định kiểu" (headless) xử lý sẵn hành vi phức tạp: điều hướng bàn phím, quản lý tiêu điểm, thuộc tính hỗ trợ truy cập (ARIA). shadcn/ui dùng Base UI làm nền tảng hành vi.
- **Preline** bổ sung các mẫu bố cục dựng sẵn cho trang quản trị và trang giới thiệu.

### 3.3.3. Leaflet — bản đồ tương tác

Leaflet là thư viện bản đồ mã nguồn mở nhẹ (khoảng 42 KB), hỗ trợ hiển thị lớp bản đồ nền dạng ô (tile layer), đặt điểm đánh dấu (marker), cửa sổ thông tin (popup) và vẽ đường đa tuyến (polyline). Hệ thống sử dụng Leaflet để:

- Hiển thị vị trí của tour, khách sạn, nhà hàng và điểm đến trên trang chi tiết.
- Vẽ lộ trình di chuyển theo từng ngày trong phân hệ AI Trip Planner: chuỗi đường đi mã hóa (encoded polyline) do Google Routes API trả về được giải mã và vẽ lên bản đồ, kèm điểm đánh dấu đánh số thứ tự các điểm dừng.

So với việc dùng trực tiếp Google Maps JavaScript API, Leaflet không phát sinh chi phí theo lượt tải bản đồ và cho phép linh hoạt chọn nguồn bản đồ nền; dữ liệu địa điểm và tuyến đường vẫn được lấy từ Google Maps Platform (mục 3.6.1).

### 3.3.4. ApexCharts — trực quan hóa dữ liệu

ApexCharts là thư viện biểu đồ dựa trên SVG, hỗ trợ biểu đồ đường, cột, miền, tròn với hiệu ứng tương tác (chú giải, thu phóng, chú thích khi rê chuột). Thư viện được dùng trong Dashboard quản trị và trang báo cáo của nhà cung cấp để trực quan hóa: tổng giá trị giao dịch (GMV), doanh thu hoa hồng của sàn, doanh thu theo tháng, tỷ lệ đơn theo loại dịch vụ và số người dùng mới (UC-12).

### 3.3.5. Tiptap — trình soạn thảo bài viết

Tiptap là framework soạn thảo văn bản định dạng xây dựng trên ProseMirror. Hệ thống dùng Tiptap với các phần mở rộng `StarterKit` (tiêu đề, danh sách, trích dẫn, định dạng chữ), `Image` (chèn ảnh tải lên ImageKit) và `Placeholder` để xây dựng trình soạn thảo bài viết cẩm nang du lịch cho Quản trị viên (UC-11). Nội dung HTML sinh ra được làm sạch bằng thư viện **sanitize-html** trước khi lưu và hiển thị nhằm ngăn chặn tấn công chèn mã kịch bản (Cross-Site Scripting).

### 3.3.6. Các thư viện bổ trợ

| Thư viện | Vai trò |
|---|---|
| **Swiper** | Trình chiếu ảnh dạng trượt cho thư viện ảnh dịch vụ và các khối nổi bật trên trang chủ |
| **Motion** | Hiệu ứng chuyển động, chuyển cảnh mượt mà giữa các trạng thái giao diện |
| **Lucide React** | Bộ biểu tượng dạng vector thống nhất cho toàn bộ giao diện |
| **react-markdown** | Hiển thị câu trả lời dạng Markdown của chatbot AI (in đậm, danh sách, liên kết) |
| **class-variance-authority** | Quản lý các biến thể định kiểu của thành phần (kích thước, màu sắc nút bấm) |

---

## 3.4. Công nghệ lưu trữ và quản lý dữ liệu

### 3.4.1. Hệ quản trị CSDL PostgreSQL

**Giới thiệu.** PostgreSQL là hệ quản trị CSDL quan hệ (RDBMS) mã nguồn mở, nổi tiếng về độ tin cậy, tuân thủ đầy đủ các tính chất giao dịch ACID (Atomicity – Consistency – Isolation – Durability) và hỗ trợ nhiều kiểu dữ liệu nâng cao như `JSON/JSONB`, mảng, kiểu số thập phân chính xác `DECIMAL`.

**Vai trò trong hệ thống.** PostgreSQL là nơi lưu trữ toàn bộ dữ liệu nghiệp vụ, bao gồm các nhóm bảng chính:

- **Người dùng và đối tác:** `User`, `ProviderProfile`.
- **Danh mục dịch vụ:** `Tour`, `TourDeparture`, `Hotel`, `Room`, `Restaurant`, `RestaurantTimeSlot`, `Destination`, `Province`, `Tag`.
- **Giao dịch:** `TourBooking`, `HotelBooking`, `RestaurantBooking`, `Payment`, `Refund`, `Payout`.
- **Nội dung cộng đồng:** `Review`, `Article`, `ArticleComment`, `ModerationLog`.
- **Dữ liệu phục vụ AI:** `SearchHistory` (lịch sử tìm kiếm kèm vector nhúng), `ExternalPlace`, `ExternalPlaceSearch` (bộ nhớ đệm kết quả Google Places).
- **Hệ thống:** `SystemSetting`, `Notification`.

**Lý do lựa chọn.** Nghiệp vụ đặt chỗ và thanh toán đòi hỏi tính toàn vẹn dữ liệu nghiêm ngặt: việc giảm số chỗ trống của một lịch khởi hành, tạo đơn đặt và ghi nhận thanh toán phải diễn ra trong cùng một giao dịch để tránh bán vượt số chỗ (overbooking) khi nhiều khách đặt đồng thời. Các CSDL phi quan hệ (MongoDB, Firestore) linh hoạt về lược đồ nhưng yếu hơn về ràng buộc khóa ngoại và giao dịch đa bảng. Kiểu `DECIMAL(12,2)` của PostgreSQL đảm bảo tính chính xác tuyệt đối cho các phép tính tiền tệ (tổng tiền, hoa hồng sàn, số tiền chi trả cho nhà cung cấp), tránh sai số làm tròn của kiểu số thực dấu phẩy động.

Hệ thống sử dụng dịch vụ PostgreSQL đám mây không máy chủ (serverless), phù hợp với mô hình triển khai trên Vercel nơi mỗi yêu cầu có thể chạy trên một phiên bản hàm độc lập.

### 3.4.2. Prisma ORM 7

**Giới thiệu.** Prisma là bộ công cụ ORM thế hệ mới cho Node.js/TypeScript, gồm ba thành phần: **Prisma Schema** (ngôn ngữ khai báo mô hình dữ liệu), **Prisma Migrate** (quản lý phiên bản lược đồ CSDL) và **Prisma Client** (thư viện truy vấn được sinh tự động, an toàn kiểu). Phiên bản 7 chuyển sang kiến trúc trình điều khiển viết bằng TypeScript thông qua các bộ chuyển đổi (driver adapter), thay cho bộ máy truy vấn nhị phân trước đây.

**Vai trò trong hệ thống:**

- Toàn bộ mô hình dữ liệu được khai báo tập trung trong `prisma/schema.prisma`; mọi thay đổi lược đồ được ghi lại thành các tệp migration trong `prisma/migrations`, cho phép tái tạo CSDL nhất quán giữa môi trường phát triển và môi trường triển khai.
- Hệ thống dùng bộ chuyển đổi `@prisma/adapter-pg` kết nối qua trình điều khiển `pg`, giảm kích thước gói triển khai và tương thích tốt với môi trường hàm không máy chủ.
- Các truy vấn được đóng gói trong tầng repository (`src/entities/*/repo.ts`). Giao dịch tương tác `prisma.$transaction` đảm bảo các thao tác đặt chỗ, hủy đơn, hoàn tiền thực hiện nguyên tử.
- Prisma Client sử dụng truy vấn tham số hóa, loại bỏ nguy cơ tấn công chèn mã SQL (SQL Injection).

### 3.4.3. Pinecone — CSDL vector

**Giới thiệu.** Pinecone là CSDL vector được quản lý hoàn toàn trên đám mây, chuyên lưu trữ và truy vấn các vector nhiều chiều theo độ tương đồng. Thay vì tìm kiếm khớp chính xác như CSDL quan hệ, Pinecone tìm *k* vector gần nhất với vector truy vấn (k-Nearest Neighbors) bằng các cấu trúc chỉ mục xấp xỉ, cho tốc độ truy vấn tính bằng mili giây trên hàng triệu bản ghi.

**Độ đo tương đồng.** Hệ thống dùng độ tương đồng Cosine giữa vector truy vấn $\mathbf{q}$ và vector tài liệu $\mathbf{d}$:

$$\text{cosine}(\mathbf{q}, \mathbf{d}) = \frac{\mathbf{q} \cdot \mathbf{d}}{\|\mathbf{q}\| \, \|\mathbf{d}\|} = \frac{\sum_{i=1}^{n} q_i d_i}{\sqrt{\sum_{i=1}^{n} q_i^2} \sqrt{\sum_{i=1}^{n} d_i^2}}$$

Giá trị càng gần 1 thể hiện hai văn bản càng gần nhau về ngữ nghĩa, bất kể chúng có dùng chung từ khóa hay không.

**Tổ chức dữ liệu.** Một chỉ mục (index) 768 chiều được chia thành bốn không gian tên (namespace) độc lập: `tours`, `hotels`, `restaurants`, `destinations`. Mỗi bản ghi gồm khóa trùng với khóa chính trong PostgreSQL, vector nhúng của phần mô tả dịch vụ và siêu dữ liệu (metadata) như `provinceId`, `status`/`isPublished`. Siêu dữ liệu cho phép lọc ngay trong lúc tìm kiếm vector — ví dụ chỉ lấy dịch vụ đang mở bán tại Ninh Bình — thay vì lọc sau, giúp kết quả luôn đủ số lượng.

**Đồng bộ dữ liệu.** Khi nhà cung cấp tạo hoặc sửa dịch vụ, hệ thống sinh lại vector và ghi đè (upsert) lên Pinecone; khi tạm dừng hoặc xóa dịch vụ, hệ thống chỉ cập nhật trường `status` trong siêu dữ liệu mà không cần tính lại vector, tiết kiệm chi phí gọi mô hình nhúng.

**Vai trò trong hệ thống.** Pinecone là nền tảng cho ba chức năng AI: tìm kiếm ngữ nghĩa trên trang Khám phá (UC-01), công cụ `searchTours` của chatbot (UC-02) và hệ thống gợi ý cá nhân hóa (mục 3.5.5).

**Lý do lựa chọn.** Phương án thay thế là phần mở rộng `pgvector` của PostgreSQL. Tuy nhiên Pinecone được chọn vì không cần tự vận hành và tinh chỉnh chỉ mục, hỗ trợ lọc theo siêu dữ liệu và phân tách namespace sẵn có, đồng thời gói miễn phí đủ đáp ứng quy mô dữ liệu của đồ án.

### 3.4.4. Zod — kiểm tra dữ liệu theo lược đồ

Zod là thư viện khai báo lược đồ dữ liệu ưu tiên TypeScript: một lược đồ vừa dùng để kiểm tra dữ liệu lúc chạy, vừa suy ra kiểu tĩnh tương ứng. Trong hệ thống, Zod được dùng ở ba vị trí then chốt:

1. **Kiểm tra dữ liệu đầu vào của Server Actions** (biểu mẫu đặt chỗ, tạo dịch vụ, gửi đánh giá...): dữ liệu không hợp lệ bị từ chối kèm thông báo lỗi theo từng trường trước khi chạm tới CSDL.
2. **Định nghĩa tham số đầu vào của các công cụ AI**: mô hình ngôn ngữ chỉ được gọi công cụ với tham số đúng lược đồ (ví dụ `searchTours` nhận `province`, `maxPrice`, `query`).
3. **Ràng buộc đầu ra có cấu trúc của mô hình AI**: kết quả kiểm duyệt nội dung (`verdict`, `categories`, `confidence`, `reason`) và lịch trình du lịch được mô hình sinh ra đúng định dạng JSON đã khai báo, thay vì văn bản tự do khó xử lý.

---

## 3.5. Công nghệ Trí tuệ nhân tạo

### 3.5.1. Mô hình ngôn ngữ lớn Google Gemini trên Vertex AI

**Giới thiệu.** Gemini là họ mô hình ngôn ngữ lớn đa phương thức do Google DeepMind phát triển. Hệ thống sử dụng mô hình **Gemini 3 Flash** (`gemini-3-flash-preview`) — phiên bản được tối ưu cho tốc độ phản hồi và chi phí thấp nhưng vẫn có năng lực suy luận, gọi công cụ và sinh đầu ra có cấu trúc tốt. Mô hình được truy cập qua **Google Cloud Vertex AI**, nền tảng học máy cấp doanh nghiệp của Google Cloud.

**Vai trò trong hệ thống.** Một mô hình duy nhất phục vụ ba phân hệ AI với ba cách khai thác khác nhau:

| Phân hệ | Cách khai thác | Đặc điểm |
|---|---|---|
| **Trợ lý ảo Roamly AI** (`/api/chat`) | `streamText` + gọi công cụ | Truyền phát câu trả lời, tối đa 4 bước suy luận – gọi công cụ |
| **AI Trip Planner** (`/api/trip-chat`) | `streamText` + gọi công cụ | Hội thoại nhiều lượt, tối đa 10 bước, kết thúc bằng công cụ `setItinerary` ghi lịch trình |
| **Kiểm duyệt nội dung** | `generateText` + `Output.object` | Đầu ra JSON theo lược đồ Zod, giới hạn thời gian 10 giây |

**Lý do lựa chọn:**

- **Hỗ trợ tiếng Việt tốt**, hiểu cả từ lóng và cách viết tắt phổ biến — yếu tố bắt buộc với chatbot tư vấn và bộ lọc kiểm duyệt.
- **Cửa sổ ngữ cảnh lớn** cho phép đưa nhiều kết quả công cụ (danh sách tour, địa điểm) vào cùng một lượt suy luận.
- **Tích hợp sẵn công cụ Google Search Grounding** trên Vertex AI, cho phép mô hình tra cứu web khi dữ liệu nội bộ và Google Places không đủ.
- **Xác thực không dùng khóa API:** Vertex AI cho phép xác thực bằng tài khoản dịch vụ thay vì khóa API tĩnh. Trên môi trường Vercel, hệ thống dùng cơ chế **Workload Identity Federation**: mã thông báo OIDC do Vercel cấp cho mỗi lần triển khai được đổi lấy quyền truy cập tạm thời của tài khoản dịch vụ Google Cloud (thư viện `google-auth-library` và `@vercel/oidc`). Trên máy phát triển, hệ thống dùng Application Default Credentials. Nhờ vậy không có bí mật dài hạn nào phải lưu trong biến môi trường, giảm rủi ro lộ khóa.

### 3.5.2. Vercel AI SDK

**Giới thiệu.** Vercel AI SDK là bộ thư viện TypeScript mã nguồn mở cung cấp giao diện lập trình thống nhất để làm việc với nhiều nhà cung cấp mô hình AI (Google, OpenAI, Anthropic...). Bộ thư viện gồm phần lõi (`ai`) chạy phía máy chủ, các gói nhà cung cấp (`@ai-sdk/google`, `@ai-sdk/google-vertex`) và phần giao diện (`@ai-sdk/react`).

**Các năng lực được khai thác:**

- **Truyền phát dữ liệu (Streaming):** Hàm `streamText` trả về từng phần câu trả lời ngay khi mô hình sinh ra; phía giao diện, hook `useChat` nhận luồng dữ liệu và hiển thị dần từng chữ. Người dùng thấy phản hồi gần như tức thì thay vì chờ toàn bộ câu trả lời, đáp ứng yêu cầu độ trễ nêu ở mục 2.4.1.
- **Gọi công cụ (Tool Calling):** Mỗi công cụ được khai báo bằng hàm `tool()` gồm mô tả, lược đồ tham số Zod và hàm thực thi. Mô hình tự quyết định gọi công cụ nào; SDK thực thi hàm, đưa kết quả trở lại mô hình và lặp lại cho tới khi đạt điều kiện dừng (`stopWhen: isStepCount(n)`). Đây chính là cơ chế hiện thực kiến trúc RAG có neo dữ liệu (Grounded RAG) đã trình bày ở mục 1.3.2.
- **Đầu ra có cấu trúc:** `Output.object({ schema })` buộc mô hình trả về JSON đúng lược đồ, được dùng cho kiểm duyệt nội dung.
- **Thông điệp giao diện có kiểu (Typed UI Messages):** Kết quả của từng công cụ được truyền xuống giao diện cùng kiểu dữ liệu, cho phép hiển thị thẻ dịch vụ (UI Cards) với ảnh, giá, số sao và nút đặt chỗ ngay trong khung hội thoại.
- **Đo đạc (Telemetry):** Mỗi lời gọi được gắn `functionId` và phát sinh dữ liệu theo chuẩn OpenTelemetry, làm đầu vào cho Langfuse (mục 3.7.3).

Danh sách công cụ được cung cấp cho mô hình trong hai phân hệ hội thoại:

| Công cụ | Phân hệ | Chức năng | Nguồn dữ liệu |
|---|---|---|---|
| `searchTours` | Chatbot | Tìm tour đang mở bán theo tỉnh, giá, mô tả ngữ nghĩa | Pinecone + PostgreSQL |
| `searchPlaces` | Chatbot, Trip Planner | Tìm nhà hàng, khách sạn, điểm tham quan thực tế | Google Places API (có bộ nhớ đệm) |
| `searchWeb` | Trip Planner | Tra cứu thông tin web khi các nguồn trên không đủ | Google Search Grounding |
| `askUser` | Chatbot, Trip Planner | Hỏi lại một câu khi yêu cầu còn mơ hồ | — |
| `openTripPlanner` | Chatbot | Chuyển người dùng sang trang lập lịch trình | — |
| `setItinerary` | Trip Planner | Ghi lịch trình đã kiểm tra hợp lệ và tính lộ trình | Google Routes API |

**Lý do lựa chọn.** So với LangChain, Vercel AI SDK gọn nhẹ hơn, có kiểu dữ liệu TypeScript chặt chẽ và được thiết kế riêng cho Next.js (truyền phát qua Route Handler, hook React đi kèm). Việc trừu tượng hóa nhà cung cấp cũng cho phép đổi mô hình chỉ bằng một dòng cấu hình.

### 3.5.3. Mô hình nhúng văn bản Gemini Embedding

**Giới thiệu.** Mô hình nhúng (embedding model) ánh xạ một đoạn văn bản thành một vector số thực có số chiều cố định sao cho các văn bản gần nghĩa có vector gần nhau trong không gian. Hệ thống dùng mô hình **`gemini-embedding-001`** của Google với số chiều đầu ra được rút gọn còn **768** (tham số `outputDimensionality`), cân bằng giữa độ chính xác và chi phí lưu trữ, truy vấn.

**Vai trò trong hệ thống:**

- **Nhúng dữ liệu dịch vụ:** Tên, mô tả, điểm nổi bật, thẻ phân loại và địa điểm của mỗi tour, khách sạn, nhà hàng, điểm đến được ghép thành một đoạn văn bản và nhúng thành vector lưu trên Pinecone.
- **Nhúng câu truy vấn:** Câu tìm kiếm tự nhiên của người dùng (ví dụ *"chùa cổ tâm linh"*, *"hải sản tươi"*) được nhúng cùng mô hình để so khớp.
- **Bộ nhớ đệm vector:** Vector của câu truy vấn được lưu cùng lịch sử tìm kiếm trong bảng `SearchHistory`; lần tìm lại cùng câu sẽ dùng vector đã lưu, không gọi lại mô hình.

### 3.5.4. Tìm kiếm ngữ nghĩa kết hợp (Hybrid Search)

Trên trang Khám phá, hệ thống kết hợp hai cơ chế: **lọc thuộc tính và từ khóa** trên PostgreSQL (tỉnh/thành, khoảng giá, thẻ, số sao) và **tìm kiếm ngữ nghĩa** trên Pinecone. Do điểm Cosine tuyệt đối của mô hình nhúng dao động theo từng câu truy vấn, hệ thống áp dụng **ngưỡng tương đối**: chỉ giữ các kết quả có điểm không thấp hơn điểm cao nhất trừ đi một biên độ (0,07) và không thấp hơn một ngưỡng sàn (0,60) đã được đo đạc trên dữ liệu thực. Cách làm này loại bỏ các kết quả kém liên quan mà vẫn giữ lại đầy đủ các mục đúng nhu cầu. Nếu Pinecone gặp sự cố, hệ thống tự động quay về tìm kiếm theo từ khóa để đảm bảo tính sẵn sàng.

### 3.5.5. Gợi ý cá nhân hóa dựa trên vector hồ sơ người dùng

Hệ thống gợi ý áp dụng phương pháp **lọc theo nội dung (Content-based Filtering)** trên không gian vector đã có sẵn:

1. **Xây dựng vector hồ sơ:** Lấy trung bình các vector của lịch sử tìm kiếm và của các dịch vụ người dùng đã đặt (bỏ qua các đơn đã hủy, hết hạn), sau đó chuẩn hóa L2. Vector này biểu diễn "sở thích" của người dùng trong cùng không gian ngữ nghĩa với dịch vụ.
2. **Truy xuất ứng viên:** Truy vấn Pinecone lấy 20 ứng viên gần nhất cho mỗi loại dịch vụ, loại trừ các mục đã đặt.
3. **Xếp hạng lại:** Mỗi ứng viên được chấm điểm theo công thức kết hợp độ tương đồng sở thích và mức độ phù hợp ngân sách:

$$\text{Score} = 0{,}7 \times \text{Similarity}_{\text{cosine}} + 0{,}3 \times \text{PriceFit}$$

trong đó $\text{PriceFit}$ phản ánh độ gần giữa giá ứng viên và mức giá trung bình người dùng từng chi trả cho loại dịch vụ đó. Bốn mục điểm cao nhất mỗi loại được hiển thị trên trang chủ.

Ưu điểm của phương pháp này là không cần huấn luyện mô hình riêng và hoạt động ngay cả khi số lượng người dùng còn ít — hạn chế lớn của phương pháp lọc cộng tác (Collaborative Filtering) trong giai đoạn đầu vận hành.

### 3.5.6. Kiểm duyệt nội dung hai tầng

Chức năng kiểm duyệt đánh giá và bình luận (UC-06) kết hợp hai kỹ thuật:

- **Tầng 1 – Lọc từ khóa:** Văn bản được chuẩn hóa (bỏ dấu, chữ thường, gộp ký tự lặp, nhận diện cách viết lách luật) rồi so khớp với danh sách từ ngữ vi phạm. Nội dung thô tục rõ ràng bị chặn ngay mà không cần gọi AI, tiết kiệm chi phí và thời gian.
- **Tầng 2 – Phân tích ngữ nghĩa bằng LLM:** Gemini nhận nội dung cùng ngữ cảnh (loại nội dung, đối tượng được đánh giá, số sao, gợi ý từ tầng 1) và trả về kết quả có cấu trúc gồm phán quyết (`approve` / `review` / `reject`), danh mục vi phạm, độ tin cậy và lý do. Nội dung bị đánh giá vi phạm với độ tin cậy từ 0,8 trở lên được ẩn tự động; các trường hợp không chắc chắn hoặc khi AI gặp lỗi được chuyển vào hàng chờ Quản trị viên duyệt. Câu lệnh hệ thống được thiết kế để chống tấn công chèn chỉ dẫn (prompt injection): nội dung người dùng được đặt trong thẻ phân cách và mô hình được yêu cầu coi đó là dữ liệu, không phải mệnh lệnh.

Mọi quyết định ở cả hai tầng được ghi vào bảng `ModerationLog` (giai đoạn, phán quyết, độ tin cậy, độ trễ) phục vụ thống kê và đánh giá chất lượng kiểm duyệt.

---

## 3.6. Dịch vụ tích hợp bên ngoài

### 3.6.1. Google Maps Platform: Places API (New) và Routes API

**Google Places API (New)** cung cấp thông tin về hàng trăm triệu địa điểm trên toàn cầu: tên, địa chỉ, tọa độ, loại hình, giờ mở cửa, điểm đánh giá, ảnh. Hệ thống dùng chức năng tìm kiếm theo văn bản (Text Search) để chatbot và Trip Planner gợi ý nhà hàng, điểm tham quan có thật ngoài danh mục của sàn. Để giảm chi phí và độ trễ, kết quả được lưu đệm trong PostgreSQL (`ExternalPlace`, `ExternalPlaceSearch`) kèm thời hạn sử dụng; ảnh địa điểm được phục vụ qua điểm cuối trung gian `/api/place-photo/[placeId]` nhằm không để lộ khóa API ra trình duyệt.

**Google Routes API** cung cấp hai chức năng được hệ thống sử dụng:

- **Compute Routes:** tính quãng đường (mét), thời gian di chuyển (giây) và chuỗi đường đi mã hóa giữa hai điểm liên tiếp theo phương tiện ô tô (`DRIVE`), xe máy (`TWO_WHEELER`) hoặc đi bộ (`WALK`). Hỗ trợ xe máy là điểm phù hợp đặc biệt với thói quen di chuyển tại Việt Nam.
- **Compute Route Matrix:** tính ma trận thời gian di chuyển giữa mọi cặp điểm trong một ngày, làm đầu vào cho thuật toán sắp xếp thứ tự tham quan.

**Thuật toán tối ưu thứ tự tham quan.** Dựa trên ma trận thời gian, hệ thống giải bài toán tìm đường đi ngắn nhất qua các điểm (biến thể của bài toán Người du lịch – Travelling Salesman Problem): với số điểm nhỏ, hệ thống duyệt toàn bộ hoán vị để tìm lời giải tối ưu; với số điểm lớn hơn, hệ thống dùng heuristic **láng giềng gần nhất (Nearest Neighbor)** để dựng lời giải ban đầu rồi cải thiện bằng thuật toán **2-opt** (đảo ngược từng đoạn đường nếu làm giảm tổng thời gian). Các bữa ăn và nơi lưu trú được giữ cố định theo khung giờ, chỉ các điểm tham quan giữa hai mốc liền kề được hoán đổi, nhờ đó lộ trình vừa ngắn vừa hợp lý về sinh hoạt.

Kết quả từ Routes API được lưu đệm trong bộ nhớ (tối đa 500 mục) theo tọa độ làm tròn, tránh gọi lặp khi người dùng chỉnh sửa lịch trình.

### 3.6.2. Cổng thanh toán PayPal REST API

PayPal cung cấp bộ giao diện lập trình REST cho thanh toán trực tuyến quốc tế. Hệ thống tích hợp bốn nhóm chức năng, tương ứng với mô hình ký quỹ đã phân tích ở mục 1.3.5 và 2.1.3:

| Chức năng | API PayPal | Sử dụng trong hệ thống |
|---|---|---|
| Thu tiền | **Orders API v2** (create, capture) | Khởi tạo giao dịch sau khi quy đổi giá trị đơn từ VND sang USD; xác nhận thanh toán khi khách hàng phê duyệt |
| Hoàn tiền | **Payments API – Refund** | Hoàn tiền tự động khi khách hủy đơn hợp lệ |
| Chi trả | **Payouts API** | Chuyển doanh thu thực nhận (sau hoa hồng) tới tài khoản PayPal của nhà cung cấp khi đơn hoàn thành |
| Thông báo | **Webhooks** | Nhận sự kiện bất đồng bộ (thanh toán thành công, hoàn tiền, chi trả); xác minh chữ ký sự kiện và xử lý lũy đẳng (idempotent) |
| Liên kết tài khoản | **Log in with PayPal (OAuth 2.0)** | Nhà cung cấp đăng nhập PayPal để xác minh tài khoản nhận tiền |

Toàn bộ thông tin thẻ được nhập trên giao diện của PayPal, hệ thống không lưu trữ dữ liệu thẻ, giảm phạm vi trách nhiệm bảo mật dữ liệu thanh toán. Môi trường thử nghiệm (Sandbox) và môi trường thật được chuyển đổi qua biến cấu hình `PAYPAL_MODE`.

### 3.6.3. ImageKit — lưu trữ và phân phối hình ảnh

ImageKit là dịch vụ lưu trữ hình ảnh kèm CDN và khả năng biến đổi ảnh theo thời gian thực qua tham số URL (thay đổi kích thước, cắt, nén, chuyển định dạng WebP/AVIF). Hệ thống dùng ImageKit lưu ảnh dịch vụ, ảnh điểm đến, ảnh bài viết, ảnh đại diện và chữ ký nhà cung cấp. Ảnh được tải lên từ máy chủ bằng khóa bí mật (không để lộ khóa ra trình duyệt) và được phân phối tới người dùng qua mạng CDN của ImageKit, giảm tải cho máy chủ ứng dụng và rút ngắn thời gian tải ảnh. Khả năng biến đổi ảnh theo URL của ImageKit cũng mở ra hướng tối ưu dung lượng ảnh theo từng thiết bị trong tương lai.

### 3.6.4. Auth.js (NextAuth v5) và bcryptjs — xác thực và phân quyền

**Auth.js** là thư viện xác thực mã nguồn mở dành cho Next.js. Hệ thống cấu hình:

- **Nhà cung cấp Credentials:** đăng nhập bằng email và mật khẩu.
- **Chiến lược phiên JWT:** thông tin phiên (mã người dùng, vai trò `customer` / `provider` / `admin`) được ký và lưu trong cookie `HttpOnly`, không cần bảng phiên trong CSDL, phù hợp với môi trường không máy chủ.
- **Phân quyền nhiều lớp (RBAC):** kiểm tra vai trò tại `proxy.ts` cho khu vực quản trị, tại layout của từng nhóm route và lặp lại trong từng Server Action trước khi thực hiện thao tác ghi, đảm bảo người dùng không thể vượt quyền bằng cách gọi trực tiếp điểm cuối.

**bcryptjs** băm mật khẩu một chiều bằng thuật toán Bcrypt có muối (salt) ngẫu nhiên, đảm bảo mật khẩu không thể khôi phục ngay cả khi CSDL bị lộ.

### 3.6.5. ExcelJS — xuất báo cáo

ExcelJS là thư viện đọc ghi tệp Microsoft Excel. Hệ thống dùng thư viện để sinh tệp `.xlsx` từ dữ liệu đơn đặt, doanh thu cho Quản trị viên và Nhà cung cấp, có định dạng tiêu đề, độ rộng cột và định dạng số tiền, phục vụ đối soát và lưu trữ ngoài hệ thống.

---

## 3.7. Triển khai, vận hành và giám sát

### 3.7.1. Vercel — nền tảng triển khai

Vercel là nền tảng đám mây chuyên triển khai ứng dụng web giao diện và Next.js. Hệ thống được triển khai tại Vercel với các đặc điểm:

- **Triển khai liên tục:** mỗi lần đẩy mã lên kho GitHub, Vercel tự động biên dịch và tạo bản triển khai mới; mỗi nhánh tính năng có bản xem trước riêng.
- **Hàm không máy chủ (Serverless Functions):** các trang kết xuất động, Server Actions và Route Handlers chạy dưới dạng hàm tự co giãn theo lưu lượng. Các điểm cuối AI được cấu hình thời gian chạy tối đa 60 giây (`maxDuration`) để đủ cho nhiều bước gọi công cụ.
- **Mạng phân phối biên:** tài nguyên tĩnh và trang tĩnh được lưu đệm tại các máy chủ biên gần người dùng.
- **Vercel OIDC:** cấp mã định danh cho từng bản triển khai, làm nền tảng cho xác thực không khóa tới Vertex AI (mục 3.5.1).

### 3.7.2. Vercel Cron Jobs — tác vụ định kỳ

Cron Jobs được khai báo trong `vercel.json`, gọi các điểm cuối `/api/cron/purge-stopped-tours`, `/api/cron/purge-stopped-hotels`, `/api/cron/purge-stopped-restaurants` vào 17:00 UTC (00:00 giờ Việt Nam) hằng ngày để xóa mềm các dịch vụ đã tạm dừng quá 30 ngày. Mỗi yêu cầu phải mang mã bí mật `CRON_SECRET` trong tiêu đề xác thực, ngăn bên ngoài kích hoạt tác vụ.

### 3.7.3. Langfuse và OpenTelemetry — giám sát mô hình AI

**OpenTelemetry** là tiêu chuẩn mở về thu thập dữ liệu quan sát (trace, metric, log) cho phần mềm. **Langfuse** là nền tảng mã nguồn mở chuyên quan sát các ứng dụng LLM, tiếp nhận dữ liệu theo chuẩn OpenTelemetry.

Hệ thống đăng ký bộ xử lý `LangfuseSpanProcessor` trong tệp `src/instrumentation.ts` (được Next.js tự động nạp khi khởi động máy chủ). Mỗi phiên hội thoại được bọc trong một trace mang mã phiên và mã người dùng; bên trong ghi lại chi tiết từng bước: câu lệnh gửi mô hình, công cụ được gọi kèm tham số và kết quả, số token đầu vào/đầu ra, độ trễ của từng bước. Dữ liệu được đẩy lên Langfuse sau khi phản hồi kết thúc (qua `after()`), không ảnh hưởng tới thời gian phản hồi người dùng.

Nhờ Langfuse, nhóm phát triển có thể: phát hiện các trường hợp mô hình gọi sai công cụ hoặc trả lời không neo dữ liệu; đo chi phí token theo từng chức năng (`chat`, `trip-chat`, `moderate-content`); và so sánh hiệu quả trước – sau khi tinh chỉnh câu lệnh hệ thống. Đây là cơ sở cho phần đánh giá chất lượng AI ở Chương 5.

---

## 3.8. Tổng kết chương

Chương 3 đã trình bày toàn bộ các công nghệ được sử dụng để xây dựng hệ thống Roamly. Việc lựa chọn công nghệ dựa trên ba tiêu chí chính:

1. **Thống nhất và hiệu quả phát triển:** Next.js, React và TypeScript cho phép xây dựng toàn bộ hệ thống trong một dự án, một ngôn ngữ, với kiểu dữ liệu xuyên suốt từ CSDL (Prisma) qua kiểm tra dữ liệu (Zod) tới mô hình AI (Vercel AI SDK).
2. **Tin cậy cho nghiệp vụ giao dịch:** PostgreSQL với giao dịch ACID và kiểu số thập phân chính xác, kết hợp PayPal với Orders, Refunds, Payouts và Webhooks, đảm bảo luồng tiền ký quỹ – hoàn tiền – chi trả chính xác và an toàn.
3. **Năng lực AI hiện đại có kiểm soát:** Gemini trên Vertex AI kết hợp Pinecone và Gemini Embedding hiện thực các kỹ thuật RAG, tìm kiếm ngữ nghĩa, gợi ý cá nhân hóa và kiểm duyệt nội dung; Google Places và Routes API neo câu trả lời của AI vào dữ liệu địa lý thực tế; Langfuse giúp quan sát và đánh giá chất lượng các thành phần AI.

Trên nền tảng công nghệ này, chương tiếp theo sẽ trình bày chi tiết thiết kế kiến trúc hệ thống và cơ sở dữ liệu.

---

# CHƯƠNG 4: PHÁT TRIỂN VÀ TRIỂN KHAI ỨNG DỤNG

Trên cơ sở các yêu cầu đã phân tích ở Chương 2 và nền tảng công nghệ đã lựa chọn ở Chương 3, chương này trình bày quá trình hiện thực hóa hệ thống Roamly: thiết kế kiến trúc tổng thể, thiết kế CSDL, cách phát triển các luồng nghiệp vụ cốt lõi và các phân hệ Trí tuệ nhân tạo, kết quả xây dựng giao diện và quy trình triển khai hệ thống lên môi trường thực tế.

## 4.1. Thiết kế kiến trúc tổng thể

### 4.1.1. Mô hình kiến trúc phân tầng

Hệ thống được tổ chức thành bốn tầng logic, mỗi tầng chỉ phụ thuộc vào tầng ngay bên dưới:

```mermaid
flowchart TB
    subgraph Client["TRÌNH DUYỆT NGƯỜI DÙNG"]
        UI["Giao diện React 19<br/>(Server Components + Client Components)"]
    end

    subgraph Vercel["MÁY CHỦ NEXT.JS 16 TRÊN VERCEL"]
        direction TB
        subgraph L1["Tầng trình bày & định tuyến — src/app"]
            Pages["Trang (page.tsx, layout.tsx)<br/>Route Groups theo vai trò"]
            API["Route Handlers<br/>/api/chat, /api/trip-chat, /api/paypal/*, /api/cron/*"]
            Proxy["proxy.ts<br/>(chặn /admin/*)"]
        end
        subgraph L2["Tầng tính năng — src/features"]
            Actions["Server Actions<br/>(kiểm tra quyền + Zod)"]
            FeatureLib["Logic nghiệp vụ<br/>chat tools, trip planner, recommend, explore"]
        end
        subgraph L3["Tầng thực thể — src/entities"]
            Repo["Repository (Prisma)<br/>tour, hotel, booking, review, setting..."]
            Schema["Lược đồ Zod & kiểu dữ liệu"]
        end
        subgraph L4["Tầng tích hợp — src/lib"]
            Clients["prisma · pinecone · vertex · gemini<br/>paypal · google-routes · imagekit · moderation · telemetry"]
        end
    end

    subgraph External["DỊCH VỤ BÊN NGOÀI"]
        PG[("PostgreSQL")]
        PC[("Pinecone")]
        VX["Vertex AI (Gemini)"]
        GM["Google Places / Routes"]
        PP["PayPal"]
        IK["ImageKit CDN"]
        LF["Langfuse"]
    end

    UI --> Pages
    UI --> API
    UI --> Actions
    Pages --> FeatureLib
    API --> FeatureLib
    Actions --> FeatureLib
    FeatureLib --> Repo
    Actions --> Repo
    Repo --> Clients
    FeatureLib --> Clients
    Clients --> PG & PC & VX & GM & PP & IK & LF
```

- **Tầng trình bày và định tuyến (`src/app`)** chỉ làm nhiệm vụ nhận yêu cầu, gọi tầng tính năng và kết xuất giao diện. Các nhóm route `(customer)`, `(account)`, `(auth)`, `(provider)`, `(admin)` có bố cục và cơ chế bảo vệ riêng.
- **Tầng tính năng (`src/features`)** chứa các Server Action và logic nghiệp vụ được nhóm theo vai trò (`customer`, `provider`, `admin`) và theo phân hệ lớn (`trip-planner`, `notification`, `invoice`). Mỗi Server Action đều thực hiện ba bước cố định: xác thực vai trò → kiểm tra dữ liệu bằng Zod → gọi repository.
- **Tầng thực thể (`src/entities`)** gói toàn bộ truy vấn CSDL theo từng thực thể nghiệp vụ. Không có mã nào ngoài tầng này gọi trực tiếp Prisma cho dữ liệu nghiệp vụ, nhờ đó các quy tắc toàn vẹn (giữ chỗ, chuyển trạng thái đơn) được tập trung tại một chỗ.
- **Tầng tích hợp (`src/lib`)** là các client mỏng bọc dịch vụ ngoài; thay đổi nhà cung cấp chỉ ảnh hưởng tới tầng này.

### 4.1.2. Cơ chế xử lý một yêu cầu

Hệ thống sử dụng ba kiểu giao tiếp giữa trình duyệt và máy chủ, mỗi kiểu phù hợp với một loại tác vụ:

| Kiểu giao tiếp | Dùng cho | Ví dụ trong hệ thống |
|---|---|---|
| **Server Components** (đọc dữ liệu khi kết xuất) | Hiển thị trang danh sách, chi tiết, dashboard | `/explore`, `/tours/[slug]`, `/admin/reports` |
| **Server Actions** (gọi hàm máy chủ từ biểu mẫu) | Mọi thao tác ghi dữ liệu | Tạo đơn đặt, gửi đánh giá, duyệt hồ sơ, cập nhật cấu hình |
| **Route Handlers** (điểm cuối HTTP) | Truyền phát dữ liệu, nhận gọi từ hệ thống ngoài | `/api/chat` (stream), `/api/paypal/webhooks`, `/api/cron/*` |

Các lỗi nghiệp vụ được chuẩn hóa thành các lớp `ValidationError`, `NotFoundError`, `ConflictError` và được hàm bao `runAction` chuyển thành kết quả có cấu trúc `{ status, formError, fieldErrors }` trả về giao diện, giúp biểu mẫu hiển thị lỗi theo từng trường mà không làm sập trang.

---

## 4.2. Thiết kế cơ sở dữ liệu

### 4.2.1. Sơ đồ quan hệ thực thể (ERD)

CSDL gồm khoảng 30 bảng, được chia thành sáu nhóm. Sơ đồ dưới đây thể hiện các thực thể chính và quan hệ giữa chúng (lược bỏ bớt thuộc tính để dễ theo dõi):

```mermaid
erDiagram
    User ||--o{ ProviderProfile : "sở hữu"
    User ||--o{ TourBooking : "đặt"
    User ||--o{ HotelBooking : "đặt"
    User ||--o{ RestaurantBooking : "đặt"
    User ||--o{ Review : "viết"
    User ||--o{ SearchHistory : "tìm kiếm"
    User ||--o{ Notification : "nhận"

    Province ||--o{ Tour : "thuộc"
    Province ||--o{ Hotel : "thuộc"
    Province ||--o{ Restaurant : "thuộc"
    Province ||--o{ Destination : "thuộc"

    ProviderProfile ||--o{ Tour : "cung cấp"
    ProviderProfile ||--o{ Hotel : "cung cấp"
    ProviderProfile ||--o{ Restaurant : "cung cấp"
    ProviderProfile ||--o{ Payout : "nhận"

    Tour ||--o{ TourDeparture : "có lịch"
    TourDeparture ||--o{ TourBooking : "được đặt"
    Hotel ||--o{ Room : "có phòng"
    Room ||--o{ HotelBooking : "được đặt"
    Restaurant ||--o{ RestaurantTimeSlot : "có khung giờ"
    RestaurantTimeSlot ||--o{ RestaurantBooking : "được đặt"

    TourBooking ||--o{ Payment : "thanh toán"
    HotelBooking ||--o{ Payment : "thanh toán"
    Payment ||--o{ Refund : "hoàn tiền"
    TourBooking ||--o{ Refund : "có"
    TourBooking ||--o| Payout : "chi trả"
    HotelBooking ||--o| Payout : "chi trả"

    TourBooking ||--o| Review : "được đánh giá"
    HotelBooking ||--o| Review : "được đánh giá"
    RestaurantBooking ||--o| Review : "được đánh giá"

    Article ||--o{ ArticleComment : "có"
    Tag }o--o{ Tour : "gắn thẻ"

    User {
        string id PK
        string email UK
        string phone UK
        string password "băm bcrypt"
        Role role
        UserStatus status
    }
    ProviderProfile {
        string id PK
        string userId FK
        BusinessType businessType
        ApprovalStatus approvalStatus
        string paypalPayerId
    }
    TourDeparture {
        string id PK
        string tourId FK
        datetime departureDate
        int totalSlots
        int bookedSlots
        decimal price
    }
    TourBooking {
        string id PK
        string code UK
        BookingStatus status
        int guests
        decimal totalAmount
        decimal commissionRate
        decimal platformFee
        decimal providerAmount
        datetime expiresAt
    }
    Payment {
        string id PK
        string gatewayOrderId UK
        string gatewayCaptureId
        TransactionStatus status
        decimal chargedAmount
    }
```

### 4.2.2. Mô tả các nhóm bảng

| Nhóm | Bảng | Ghi chú thiết kế |
|---|---|---|
| **Người dùng** | `User`, `ProviderProfile` | Một người dùng vai trò `provider` có thể có tối đa một hồ sơ doanh nghiệp cho mỗi loại hình (`tour` / `hotel` / `restaurant`, ràng buộc duy nhất `userId + businessType`). Hồ sơ lưu mã tài khoản PayPal đã xác minh (`paypalPayerId`), ảnh chữ ký và trải qua quy trình duyệt `not_submitted → pending → approved / rejected`. |
| **Danh mục dịch vụ** | `Tour`, `TourDeparture`, `Hotel`, `Room`, `Restaurant`, `RestaurantTimeSlot`, `Destination`, `Province`, `Tag` và các bảng nối `*Tag` | Dịch vụ có trạng thái `published` / `paused` và trường `deletedAt` cho xóa mềm. Số chỗ được theo dõi trực tiếp bằng cặp `totalSlots` / `bookedSlots` trên từng lịch khởi hành. |
| **Giao dịch** | `TourBooking`, `HotelBooking`, `RestaurantBooking`, `Payment`, `Refund`, `Payout` | Đơn đặt **chụp lại** tên dịch vụ, đơn giá, tỷ lệ hoa hồng tại thời điểm đặt (`tourTitle`, `unitPrice`, `commissionRate`), nên khi nhà cung cấp đổi giá hoặc quản trị viên đổi hoa hồng, đơn cũ không bị ảnh hưởng. |
| **Nội dung cộng đồng** | `Review`, `Article`, `ArticleComment`, `ModerationLog` | Đánh giá và bình luận có trạng thái kiểm duyệt (`approved` / `pending` / `rejected`) và nguồn quyết định (`keyword` / `ai` / quản trị viên). |
| **Dữ liệu AI** | `SearchHistory`, `ExternalPlace`, `ExternalPlaceSearch` | `SearchHistory` lưu câu truy vấn đã chuẩn hóa kèm vector 768 chiều (kiểu `Float[]`), giữ tối đa 20 lượt gần nhất mỗi người. Hai bảng `ExternalPlace*` là bộ nhớ đệm kết quả tra cứu địa điểm ngoài. |
| **Hệ thống** | `SystemSetting`, `Notification` | `SystemSetting` là bảng một dòng chứa các tham số vận hành có thể chỉnh trên giao diện quản trị. |

Các tham số vận hành mặc định trong bảng `SystemSetting`:

| Tham số | Mặc định | Ý nghĩa |
|---|:---:|---|
| `commissionRate` | 0,1 | Tỷ lệ hoa hồng sàn (10%) |
| `usdRate` | 25.000 | Tỷ giá quy đổi VND → USD cho PayPal |
| `bookingHoldMinutes` | 10 | Thời gian giữ chỗ chờ thanh toán (phút) |
| `customerCancelCutoffHours` | 24 | Hạn chót khách được hủy tour/khách sạn trước giờ sử dụng (giờ) |
| `restaurantCancelCutoffHours` | 2 | Hạn chót hủy đặt bàn nhà hàng (giờ) |
| `serviceDeleteGraceDays` | 30 | Số ngày dịch vụ tạm dừng trước khi bị xóa mềm tự động |

**Quy tắc kiểu dữ liệu tiền tệ.** Mọi trường tiền dùng kiểu `DECIMAL(12,2)`, tỷ lệ dùng `DECIMAL(5,4)`; phép tính được thực hiện bằng đối tượng `Decimal` của Prisma (`mul`, `sub`, `toDecimalPlaces`) thay vì số thực JavaScript để tránh sai số làm tròn.

### 4.2.3. Vòng đời trạng thái đơn đặt chỗ

Trạng thái đơn đặt (`BookingStatus`) được thiết kế như một máy trạng thái hữu hạn; mọi chuyển trạng thái đều được kiểm tra điều kiện trong repository:

```mermaid
stateDiagram-v2
    [*] --> pending_payment : Khách tạo đơn tour/khách sạn<br/>(giữ chỗ bookingHoldMinutes)
    [*] --> pending_confirmation : Khách đặt bàn nhà hàng

    pending_payment --> paid : PayPal capture thành công
    pending_payment --> expired : Hết thời gian giữ chỗ<br/>(nhả chỗ)

    pending_confirmation --> confirmed : Nhà hàng xác nhận
    pending_confirmation --> cancelled : Nhà hàng từ chối / khách hủy

    paid --> confirmed : Nhà cung cấp xác nhận
    paid --> cancelled : Khách hủy đúng hạn / NCC hủy<br/>→ Refund
    confirmed --> cancelled : Hủy → Refund
    confirmed --> completed : NCC đánh dấu hoàn thành<br/>→ Payout
    paid --> completed : NCC đánh dấu hoàn thành<br/>→ Payout

    completed --> [*]
    cancelled --> [*]
    expired --> [*]
```

---

## 4.3. Phát triển các chức năng nghiệp vụ cốt lõi

### 4.3.1. Xác thực và phân quyền

Chức năng xác thực được cấu hình trong `src/lib/auth.ts` với Auth.js:

1. **Đăng ký:** dữ liệu biểu mẫu được kiểm tra bằng Zod (định dạng email, số điện thoại, độ dài mật khẩu), mật khẩu được băm bằng bcrypt rồi lưu vào bảng `User` với vai trò `customer` hoặc `provider`.
2. **Đăng nhập:** nhà cung cấp `Credentials` tìm người dùng theo email và so khớp mật khẩu nhập vào với giá trị băm bằng `bcrypt.compare`.
3. **Phiên làm việc:** chiến lược `jwt` lưu `id` và `role` trong mã thông báo đã ký; hàm callback đưa hai giá trị này vào đối tượng `session` để mọi Server Component và Server Action đều đọc được.
4. **Phân quyền nhiều lớp:**
   - `proxy.ts` chuyển hướng mọi truy cập `/admin/*` không phải quản trị viên về `/admin/sign-in`;
   - layout của nhóm `(provider)` và `(account)` kiểm tra vai trò trước khi kết xuất;
   - mỗi Server Action gọi các hàm `requireCustomerId()`, `requireTourProviderId()`... và chỉ thao tác trên bản ghi thuộc sở hữu của chính người gọi (ví dụ truy vấn đơn đặt luôn kèm điều kiện `providerProfileId`), chống tấn công truy cập trực tiếp đối tượng không được phép.

### 4.3.2. Quản lý dịch vụ và đồng bộ dữ liệu vector

Khi nhà cung cấp tạo hoặc cập nhật tour, khách sạn, nhà hàng (UC-08), Server Action thực hiện tuần tự:

1. Kiểm tra hồ sơ doanh nghiệp đã được duyệt và đúng loại hình.
2. Kiểm tra dữ liệu bằng Zod; tải ảnh lên ImageKit và lưu URL trả về.
3. Ghi dữ liệu vào PostgreSQL (dịch vụ, lịch khởi hành / phòng / khung giờ, thẻ phân loại).
4. Ghép văn bản đại diện của dịch vụ bằng các hàm `build*EmbeddingText` (tên, mô tả, điểm nổi bật, tỉnh/thành, thẻ), gọi `embedText()` để sinh vector 768 chiều và `upsert` lên namespace tương ứng của Pinecone, kèm siêu dữ liệu `provinceId`, `status`.
5. Nếu bước đồng bộ vector thất bại, dữ liệu chính vẫn được lưu; hệ thống ghi nhận lỗi và có thể đồng bộ lại toàn bộ bằng tập lệnh `bun run db:embed`.

Khi tạm dừng dịch vụ, hệ thống chỉ cập nhật trường `status` trong siêu dữ liệu Pinecone (hàm `set*EmbeddingStatus`) để dịch vụ biến mất khỏi kết quả tìm kiếm ngay lập tức mà không cần tính lại vector. Dịch vụ tạm dừng quá `serviceDeleteGraceDays` ngày sẽ bị Cron Job xóa mềm.

### 4.3.3. Đặt chỗ và cơ chế giữ chỗ chống bán vượt

Bài toán khó nhất của luồng đặt chỗ là **tranh chấp đồng thời**: hai khách cùng đặt chỗ cuối cùng của một lịch khởi hành tại cùng thời điểm. Hệ thống giải quyết bằng ba kỹ thuật trên PostgreSQL, thực hiện trong một giao dịch duy nhất (`createHeld` trong `entities/tour-booking/repo.ts`):

**(1) Cập nhật có điều kiện mang tính nguyên tử.** Thay vì "đọc số chỗ trống → kiểm tra → ghi" (dễ xảy ra tranh chấp giữa bước đọc và bước ghi), hệ thống dùng một câu lệnh duy nhất:

```sql
UPDATE "TourDeparture"
SET "bookedSlots" = "bookedSlots" + :guests
WHERE "id" = :departureId
  AND "status" = 'scheduled'
  AND "departureDate" > now()
  AND "bookedSlots" + :guests <= "totalSlots";
```

Nếu số dòng bị ảnh hưởng bằng 0, nghĩa là không đủ chỗ, giao dịch bị hủy và người dùng nhận thông báo *"Không đủ chỗ trống cho số khách đã chọn"*. PostgreSQL đảm bảo hai câu lệnh `UPDATE` trên cùng một dòng được tuần tự hóa, nên không thể có hai đơn cùng chiếm chỗ cuối.

**(2) Giữ chỗ có thời hạn.** Đơn mới được tạo ở trạng thái `pending_payment` với `expiresAt = now + bookingHoldMinutes`. Giao diện hiển thị đồng hồ đếm ngược thời gian còn lại để thanh toán.

**(3) Nhả chỗ lười (lazy release) không cần tiến trình nền.** Trước mỗi lần tạo đơn hoặc đọc số chỗ trống, hệ thống chạy hàm `releaseExpired()`: một câu lệnh SQL dùng biểu thức bảng chung (CTE) chuyển các đơn quá hạn sang `expired` và trả lại số chỗ cho lịch khởi hành. Mệnh đề `FOR UPDATE SKIP LOCKED` bỏ qua các đơn đang bị giao dịch khác khóa, và điều kiện loại trừ các đơn có thanh toán đang ở trạng thái `processing` đảm bảo không nhả chỗ của khách đang trong quá trình xác nhận thanh toán.

**(4) Tính giá phía máy chủ.** Đơn giá luôn được đọc lại từ CSDL; tổng tiền, phí sàn và số tiền nhà cung cấp nhận được tính ngay khi tạo đơn:

$$\text{platformFee} = \text{round}(\text{totalAmount} \times \text{commissionRate},\ 2), \qquad \text{providerAmount} = \text{totalAmount} - \text{platformFee}$$

Dữ liệu giá từ trình duyệt không bao giờ được tin cậy. Luồng đặt phòng khách sạn áp dụng cùng cơ chế theo khoảng ngày nhận/trả phòng; luồng đặt bàn nhà hàng không thu tiền trước mà tạo đơn ở trạng thái `pending_confirmation` chờ nhà hàng xác nhận theo sức chứa khung giờ.

### 4.3.4. Thanh toán ký quỹ, hoàn tiền và chi trả doanh thu qua PayPal

Toàn bộ dòng tiền đi qua tài khoản PayPal của sàn theo mô hình ký quỹ. Sơ đồ tuần tự dưới đây mô tả vòng đời đầy đủ của một đơn tour:

```mermaid
sequenceDiagram
    autonumber
    actor C as Khách hàng
    participant W as Roamly (Next.js)
    participant DB as PostgreSQL
    participant PP as PayPal
    actor P as Nhà cung cấp

    C->>W: Chọn lịch khởi hành, số khách, thông tin liên hệ
    W->>DB: createHeld(): giữ chỗ + tạo TourBooking (pending_payment)
    C->>W: Nhấn "Thanh toán"
    W->>W: Quy đổi VND → USD theo usdRate
    W->>PP: Orders API: createOrder(amountUsd)
    PP-->>W: orderId + đường dẫn phê duyệt
    W->>DB: Tạo Payment (pending, gatewayOrderId)
    W-->>C: Chuyển hướng tới PayPal
    C->>PP: Đăng nhập ví / nhập thẻ, phê duyệt
    PP-->>W: Quay về /api/paypal/orders/return?token=orderId
    W->>DB: markPaymentProcessing(): khóa đơn (FOR UPDATE),<br/>chỉ tiếp tục nếu còn trong hạn giữ chỗ
    W->>PP: captureOrder(orderId)
    PP-->>W: captureId, COMPLETED
    W->>DB: markPaid(): Payment succeeded, TourBooking paid
    W-->>C: Trang hoàn tất + hóa đơn

    Note over C,P: ... Ngày diễn ra dịch vụ ...

    alt Dịch vụ hoàn tất
        P->>W: Đánh dấu "Hoàn thành"
        W->>DB: completeForProvider(): completed + tạo Payout
        W->>PP: Payouts API: createPayout(providerAmount → PayPal NCC)
        PP-->>W: batchId (pending)
        PP-)W: Webhook PAYMENT.PAYOUTS-ITEM.SUCCEEDED
        W->>DB: Cập nhật Payout succeeded
    else Khách / NCC hủy
        C->>W: Yêu cầu hủy (trước customerCancelCutoffHours)
        W->>DB: cancelled + tạo Refund + nhả chỗ
        W->>PP: refundCapture(captureId, amountUsd)
        PP-)W: Webhook PAYMENT.CAPTURE.REFUNDED
        W->>DB: Cập nhật Refund succeeded
    end
```

Các điểm kỹ thuật đáng chú ý:

- **Chống thanh toán cho đơn đã hết hạn:** bước `markPaymentProcessing` khóa dòng đơn đặt bằng `SELECT ... FOR UPDATE` và chỉ chuyển thanh toán sang `processing` khi đơn vẫn còn `pending_payment` và chưa quá `expiresAt`. Đồng thời, hàm nhả chỗ bỏ qua đơn có thanh toán `processing`, nên hai tiến trình "nhả chỗ" và "xác nhận thanh toán" không bao giờ xung đột.
- **Xử lý kết quả chuyển tiền thống nhất:** hàm `settleTransfer` bao lời gọi Refund/Payout, ghi kết quả (`pending` / `succeeded` / `failed`) vào bảng `Refund` hoặc `Payout`. Nếu thất bại, hệ thống tạo thông báo `transfer_failed` cho quản trị viên để xử lý thủ công.
- **Webhook an toàn và lũy đẳng:** điểm cuối `/api/paypal/webhooks` đọc nguyên văn thân yêu cầu, gọi API `verify-webhook-signature` của PayPal để xác thực chữ ký trước khi xử lý; sự kiện không hợp lệ bị trả mã 400. Mọi cập nhật đều có điều kiện theo trạng thái hiện tại, nên PayPal gửi lại một sự kiện nhiều lần cũng không gây cập nhật trùng. Khi lỗi CSDL, điểm cuối trả mã 500 để PayPal tự động gửi lại.
- **Liên kết tài khoản nhận tiền:** nhà cung cấp đăng nhập PayPal qua OAuth 2.0 (`/api/paypal/connect` → `/api/paypal/callback`); hệ thống lấy thông tin danh tính đã xác minh từ API `userinfo` và lưu vào hồ sơ, tránh việc nhập sai email nhận tiền.

### 4.3.5. Thông báo, hóa đơn và báo cáo

- **Thông báo trong ứng dụng:** mỗi sự kiện nghiệp vụ (đơn mới, đã thanh toán, đã xác nhận, đã hủy, hoàn thành, có đánh giá mới, hồ sơ được duyệt/từ chối, chuyển tiền thất bại) tạo một bản ghi `Notification` cho người liên quan. Biểu tượng chuông trên thanh điều hướng truy vấn `/api/notifications` định kỳ 30 giây một lần để cập nhật số thông báo chưa đọc.
- **Hóa đơn điện tử:** trang `/bookings/[code]/invoice` (và các trang tương ứng cho nhà cung cấp, quản trị viên) kết xuất hóa đơn gồm thông tin đơn, chi tiết thanh toán, mã giao dịch PayPal và chữ ký của nhà cung cấp, định dạng sẵn cho chức năng in của trình duyệt.
- **Báo cáo thống kê:** trang báo cáo của quản trị viên và nhà cung cấp tổng hợp dữ liệu bằng các truy vấn gom nhóm trên PostgreSQL, hiển thị bằng ApexCharts; điểm cuối `/api/admin/reports` và `/api/provider/bookings` dùng ExcelJS sinh tệp `.xlsx` theo khoảng thời gian được chọn.

---

## 4.4. Phát triển các phân hệ Trí tuệ nhân tạo

### 4.4.1. Trợ lý ảo Roamly AI (RAG kết hợp gọi công cụ)

**Kiến trúc xử lý.** Điểm cuối `/api/chat` nhận toàn bộ lịch sử hội thoại, chuyển đổi sang định dạng thông điệp của mô hình và gọi `streamText` với mô hình Gemini, câu lệnh hệ thống `CHAT_INSTRUCTIONS` và tập công cụ `chatTools`. Điều kiện dừng `isStepCount(4)` giới hạn tối đa bốn bước suy luận – gọi công cụ cho mỗi câu hỏi, đủ cho luồng "gọi công cụ → hỏi lại nếu địa danh trùng tên → trả lời" và chừa một bước dự phòng, đồng thời ngăn mô hình gọi công cụ vô hạn gây tốn chi phí.

```mermaid
sequenceDiagram
    autonumber
    actor U as Người dùng
    participant UI as Giao diện chat (useChat)
    participant API as /api/chat
    participant LLM as Gemini (Vertex AI)
    participant T as Công cụ
    participant D as Pinecone / PostgreSQL / Google Places
    participant LF as Langfuse

    U->>UI: "Quán lẩu ngon ở Cát Bà?"
    UI->>API: POST messages
    API->>LLM: streamText(instructions, tools, messages)
    LLM-->>API: tool_call searchPlaces(kind=restaurant, keyword="lẩu", location="Cát Bà")
    API->>T: Thực thi searchPlaces
    T->>D: Tra bộ nhớ đệm → Google Places Text Search
    D-->>T: Danh sách địa điểm thực tế
    T-->>API: { status: "ok", area, places[] }
    API->>LLM: Kết quả công cụ
    LLM-->>API: Văn bản trả lời (stream từng phần)
    API-->>UI: UI Message Stream (văn bản + kết quả công cụ)
    UI-->>U: Câu trả lời Markdown + thẻ địa điểm có ảnh, đánh giá, bản đồ
    API-)LF: after(): flush trace (token, độ trễ, tham số công cụ)
```

**Thiết kế câu lệnh hệ thống (Prompt Engineering).** Câu lệnh hệ thống được xây dựng thành các nhóm quy tắc rõ ràng:

- *Quy tắc neo dữ liệu:* "Chỉ nêu tên địa điểm/tour có trong kết quả công cụ. Không bịa tên, địa chỉ, giá" — biện pháp chính chống hiện tượng ảo tưởng.
- *Quy tắc chọn công cụ:* `searchTours` chỉ dùng khi người dùng hỏi tour; `searchPlaces` dùng cho chỗ ở, ăn uống, tham quan; yêu cầu lập lịch trình được chuyển sang Trip Planner qua `openTripPlanner` thay vì để chatbot tự lập.
- *Quy tắc xử lý mơ hồ:* khi công cụ trả về `status: "ambiguous"` (địa danh trùng tên ở nhiều tỉnh, ví dụ "Tân Phú"), mô hình bắt buộc gọi `askUser` với các lựa chọn công cụ đưa ra; khi `not_found`, mô hình hỏi lại thay vì tự đoán.
- *Quy tắc hiệu năng:* gọi song song mọi công cụ cần thiết trong một bước, không gọi lại công cụ trừ khi người dùng vừa chọn địa điểm.
- *Quy tắc phạm vi:* từ chối lịch sự các yêu cầu không liên quan tới du lịch.

**Hiển thị kết quả có cấu trúc.** Nhờ kiểu thông điệp `ChatMessage` được suy ra từ `InferUITools<typeof chatTools>`, giao diện biết chính xác kiểu kết quả của từng công cụ và hiển thị thành phần tương ứng: thẻ tour có giá và nút đặt chỗ, thẻ địa điểm có ảnh (qua `/api/place-photo`), nhóm nút lựa chọn cho `askUser`, nút chuyển trang cho `openTripPlanner`.

### 4.4.2. Phân hệ Lập lịch trình thông minh (AI Trip Planner)

Phân hệ Trip Planner kết hợp năng lực ngôn ngữ của mô hình với các ràng buộc kiểm tra bằng mã và dữ liệu bản đồ thực tế, theo mô hình **"AI đề xuất – mã kiểm tra – AI tự sửa"**:

```mermaid
flowchart TD
    A["Người dùng mô tả chuyến đi<br/>(điểm đến, số ngày, phương tiện, sở thích)"] --> B["/api/trip-chat<br/>streamText, tối đa 10 bước"]
    B --> C{"Đủ thông tin?"}
    C -- Chưa --> Q["askUser: hỏi thêm một câu"] --> A
    C -- Đủ --> S["searchPlaces / searchWeb<br/>lấy điểm tham quan, quán ăn, khách sạn có placeId"]
    S --> I["Mô hình gọi setItinerary<br/>(các ngày, điểm dừng, khung giờ, placeId)"]
    I --> V["buildItinerary(strict)<br/>• placeId phải tồn tại<br/>• ≤ 25 điểm/ngày<br/>• hai bữa ăn cách nhau đủ giờ"]
    V -- "invalid + danh sách lỗi" --> I
    V -- hợp lệ --> M["Routes API: Compute Route Matrix<br/>ma trận thời gian di chuyển"]
    M --> O["optimizeDay(): giữ cố định bữa ăn & khách sạn<br/>sắp lại điểm tham quan<br/>(hoán vị / láng giềng gần nhất + 2-opt)"]
    O --> R["Routes API: Compute Routes<br/>quãng đường, thời gian, polyline từng chặng"]
    R --> UI["Giao diện: lịch trình theo ngày + bản đồ Leaflet<br/>lưu vào localStorage"]
    UI -- "Người dùng xóa/sửa điểm" --> V2["buildItinerary(non-strict)<br/>chỉ cảnh báo"] --> UI
```

Các quyết định thiết kế quan trọng:

1. **Mô hình chỉ được chọn địa điểm có thật.** Lịch trình tham chiếu địa điểm bằng `placeId` lấy từ kết quả công cụ tìm kiếm; tọa độ được đọc lại từ CSDL chứ không lấy từ văn bản của mô hình. Mã định danh không tồn tại bị trả về như một lỗi.
2. **Vòng phản hồi tự sửa.** Ở chế độ `strict`, mọi vi phạm quy tắc (ví dụ *"Ngày 2: bữa trưa và bữa tối chỉ cách nhau 90 phút"*) được trả lại cho mô hình dưới dạng kết quả công cụ; mô hình đọc lỗi và gọi lại `setItinerary` với phương án đã sửa trong giới hạn 10 bước.
3. **Phân công hợp lý giữa AI và thuật toán.** Mô hình quyết định *đi đâu, ăn gì, ở đâu, khung giờ nào* (bài toán ngữ nghĩa); thuật toán quyết định *thứ tự đi* dựa trên thời gian di chuyển thực tế (bài toán tối ưu). Bữa ăn và nơi lưu trú được giữ cố định theo giờ, chỉ các điểm tham quan giữa hai mốc liền kề được hoán đổi.
4. **Phương tiện di chuyển phù hợp Việt Nam:** ô tô, xe máy hoặc đi bộ, ánh xạ sang `DRIVE`, `TWO_WHEELER`, `WALK` của Routes API.
5. **Lưu trữ phía trình duyệt.** Lịch trình và lịch sử hội thoại được lưu trong `localStorage` (khóa `roamly:trips`), cho phép cả khách vãng lai dùng chức năng mà không cần đăng nhập; mỗi lịch trình có đường dẫn riêng `/trip-planner/[id]`. Hệ thống ghi nhớ mã lời gọi `setItinerary` đã áp dụng để không ghi đè các chỉnh sửa tay của người dùng.

### 4.4.3. Tìm kiếm ngữ nghĩa và lưu lịch sử tìm kiếm

Luồng xử lý một câu tìm kiếm trên trang Khám phá:

1. Chuẩn hóa câu truy vấn (cắt khoảng trắng thừa, chuyển chữ thường).
2. Tra bảng `SearchHistory`: nếu câu này đã từng được tìm, dùng lại vector đã lưu; nếu chưa, gọi `gemini-embedding-001`.
3. Truy vấn Pinecone song song cả bốn namespace (tour, khách sạn, nhà hàng, điểm đến), mỗi loại lấy 50 kết quả gần nhất kèm điểm Cosine. Việc truy vấn cả bốn loại giúp xác định điểm cao nhất chung — nếu người dùng tìm "hải sản" trong tab Khách sạn, các khách sạn kém liên quan sẽ không lấp đầy kết quả.
4. Lọc theo ngưỡng tương đối (≥ điểm cao nhất − 0,07 và ≥ 0,60), sau đó giao với các bộ lọc thuộc tính (tỉnh, giá, thẻ, số sao) trên PostgreSQL và sắp xếp theo điểm ngữ nghĩa.
5. Với người dùng đã đăng nhập, câu truy vấn và vector được lưu (`upsert`) vào `SearchHistory`; các lượt cũ vượt quá 20 bị xóa trong cùng giao dịch.
6. Nếu Pinecone hoặc mô hình nhúng lỗi, hệ thống quay về tìm theo từ khóa.

### 4.4.4. Gợi ý cá nhân hóa trên trang chủ

Hàm `buildUserProfile` tổng hợp vector hồ sơ từ lịch sử tìm kiếm và tối đa 20 đơn gần nhất mỗi loại có ý nghĩa nhu cầu (`pending_confirmation`, `paid`, `confirmed`, `completed`), đồng thời tính giá trung bình người dùng đã chi trả theo từng loại dịch vụ. Hàm `recommend` lấy 20 ứng viên mỗi loại từ Pinecone, loại các mục đã đặt, chấm điểm lại theo công thức $0{,}7 \times \text{cosine} + 0{,}3 \times \text{PriceFit}$ và hiển thị 4 mục tốt nhất mỗi loại trong khối "Dành cho bạn" trên trang chủ. Khối này chỉ xuất hiện với khách hàng đã đăng nhập và đã có lịch sử tìm kiếm hoặc đặt chỗ; các trường hợp còn lại (khách vãng lai, người dùng mới, Pinecone lỗi) trang chủ vẫn hiển thị khối gói dịch vụ phổ biến như bình thường.

### 4.4.5. Kiểm duyệt nội dung tự động

Hàm `moderateContent` (`src/lib/moderation/index.ts`) được gọi trong Server Action gửi đánh giá (`features/customer/reviews`) và gửi bình luận bài viết (`features/customer/articles`):

```mermaid
flowchart TD
    In["Nội dung đánh giá / bình luận"] --> N["Chuẩn hóa văn bản<br/>bỏ dấu · chữ thường · gộp ký tự lặp<br/>thay số bằng chữ · ghép chữ bị tách 'đ.m.m'"]
    N --> K{"Tầng 1: Lọc từ khóa"}
    K -- "Vi phạm rõ ràng" --> B["Chặn ngay, không lưu<br/>yêu cầu người dùng sửa"]
    K -- "Sạch / nghi vấn (gợi ý)" --> AI["Tầng 2: Gemini + Output.object<br/>ngữ cảnh: loại nội dung, đối tượng, số sao, gợi ý tầng 1<br/>giới hạn 10 giây"]
    AI -- "approve" --> OK["Lưu & hiển thị công khai<br/>cập nhật điểm trung bình"]
    AI -- "reject, confidence ≥ 0,8" --> RJ["Lưu nhưng ẩn (rejected)"]
    AI -- "review / reject < 0,8" --> PD["Lưu, chờ quản trị viên duyệt (pending)"]
    AI -. "Lỗi / quá thời gian" .-> PD
    B & OK & RJ & PD --> LOG[("ModerationLog<br/>stage · verdict · categories<br/>confidence · latencyMs")]
    PD --> ADM["/admin/moderation<br/>Quản trị viên duyệt / từ chối"]
```

Nguyên tắc thiết kế: **AI không bao giờ tự quyết trong trường hợp không chắc chắn**. Chỉ những vi phạm có độ tin cậy cao mới bị ẩn tự động; khi mô hình gặp lỗi, nội dung được chuyển cho con người thay vì tự động duyệt hoặc tự động từ chối. Câu lệnh kiểm duyệt nhấn mạnh rằng phê bình tiêu cực (kể cả đánh giá 1 sao gay gắt) là quyền của khách hàng và không bị coi là vi phạm, nhằm bảo vệ tính khách quan của hệ thống đánh giá.

### 4.4.6. Giám sát các thành phần AI

Tệp `src/instrumentation.ts` khởi tạo `NodeTracerProvider` của OpenTelemetry với `LangfuseSpanProcessor` khi máy chủ khởi động (nếu có cấu hình khóa Langfuse). Hàm `withTrace` bao mỗi lời gọi chatbot và Trip Planner trong một trace có tên, mã phiên và mã người dùng; lời gọi kiểm duyệt được gắn `functionId: "moderate-content"`. Sau khi phản hồi kết thúc, `after(flushTelemetry)` đẩy dữ liệu lên Langfuse trước khi hàm không máy chủ bị thu hồi. Dữ liệu này được sử dụng để đánh giá độ trễ, chi phí token và độ chính xác gọi công cụ ở Chương 5.

---

## 4.5. Kết quả xây dựng giao diện

Hệ thống gồm khoảng 60 trang, chia theo ba phân hệ. Bảng dưới đây liệt kê các màn hình chính:

**Phân hệ Khách hàng và Khách vãng lai**

| Đường dẫn | Màn hình | Chức năng chính |
|---|---|---|
| `/` | Trang chủ | Khối tìm kiếm nhanh, gợi ý cá nhân hóa, điểm đến nổi bật, bài viết mới |
| `/explore` | Khám phá | Tìm kiếm ngữ nghĩa, lọc theo loại dịch vụ, tỉnh, giá, thẻ, số sao |
| `/tours/[slug]`, `/hotels/[slug]`, `/restaurants/[slug]`, `/destinations/[slug]` | Chi tiết dịch vụ / điểm đến | Thư viện ảnh, mô tả, lịch khởi hành / phòng / khung giờ, bản đồ, đánh giá |
| `/booking/[kind]/[slug]` | Đặt chỗ | Quy trình nhiều bước: chọn lịch → thông tin liên hệ → thanh toán (đếm ngược giữ chỗ) → hoàn tất |
| `/bookings/[code]`, `/bookings/[code]/invoice` | Chi tiết đơn, hóa đơn | Trạng thái đơn, hủy đơn, in hóa đơn |
| `/chat` | Roamly AI | Hội thoại với trợ lý ảo, thẻ tour / địa điểm trong khung chat |
| `/trip-planner`, `/trip-planner/[id]` | Lập lịch trình AI | Hội thoại lập lịch trình, lịch trình theo ngày, bản đồ lộ trình |
| `/articles`, `/articles/[slug]` | Cẩm nang du lịch | Danh sách bài viết theo danh mục, đọc bài, bình luận |
| `/dashboard`, `/my-bookings`, `/my-hotel-bookings`, `/my-restaurant-bookings`, `/profile` | Tài khoản | Tổng quan, quản lý đơn theo loại, viết đánh giá, cập nhật hồ sơ |

![Hình 4.1: Trang chủ hệ thống Roamly](images/chuong-4/hinh-4-01-trang-chu.jpg)

*Hình 4.1: Trang chủ hệ thống Roamly*

![Hình 4.2: Khối gợi ý cá nhân hóa "Dành cho bạn" trên trang chủ](images/chuong-4/hinh-4-02-goi-y-ca-nhan-hoa.jpg)

*Hình 4.2: Khối gợi ý cá nhân hóa "Dành cho bạn" trên trang chủ*

![Hình 4.3: Tìm kiếm ngữ nghĩa trên trang Khám phá với truy vấn "chùa cổ tâm linh"](images/chuong-4/hinh-4-03-kham-pha-tim-kiem-ngu-nghia.jpg)

*Hình 4.3: Tìm kiếm ngữ nghĩa trên trang Khám phá với truy vấn "chùa cổ tâm linh"*

![Hình 4.4: Trang chi tiết tour và khung chọn ngày, số khách](images/chuong-4/hinh-4-04-chi-tiet-tour.jpg)

*Hình 4.4: Trang chi tiết tour và khung chọn ngày, số khách*

![Hình 4.5: Bước nhập thông tin liên hệ trong quy trình đặt chỗ](images/chuong-4/hinh-4-05-dat-cho.jpg)

*Hình 4.5: Bước nhập thông tin liên hệ trong quy trình đặt chỗ*

![Hình 4.6: Danh sách đơn đặt tour của khách hàng](images/chuong-4/hinh-4-06-don-dat-cua-toi.jpg)

*Hình 4.6: Danh sách đơn đặt tour của khách hàng*

![Hình 4.7: Hóa đơn điện tử kèm thông tin giao dịch PayPal và chữ ký nhà cung cấp](images/chuong-4/hinh-4-07-hoa-don.jpg)

*Hình 4.7: Hóa đơn điện tử kèm thông tin giao dịch PayPal và chữ ký nhà cung cấp*

![Hình 4.8: Trang bài viết cẩm nang du lịch](images/chuong-4/hinh-4-08-bai-viet.jpg)

*Hình 4.8: Trang bài viết cẩm nang du lịch*

![Hình 4.9: Trợ lý ảo Roamly AI trả lời câu hỏi tìm tour](images/chuong-4/hinh-4-09-roamly-ai-hoi-thoai.jpg)

*Hình 4.9: Trợ lý ảo Roamly AI trả lời câu hỏi tìm tour*

![Hình 4.10: Thẻ tour do công cụ searchTours trả về trong khung hội thoại](images/chuong-4/hinh-4-10-roamly-ai-the-tour.jpg)

*Hình 4.10: Thẻ tour do công cụ searchTours trả về trong khung hội thoại*

![Hình 4.11: AI Trip Planner trong quá trình gọi công cụ tìm địa điểm và tự điều chỉnh lộ trình](images/chuong-4/hinh-4-11-trip-planner-dang-lap.jpg)

*Hình 4.11: AI Trip Planner trong quá trình gọi công cụ tìm địa điểm và tự điều chỉnh lộ trình*

![Hình 4.12: Lịch trình hoàn chỉnh kèm lộ trình trên bản đồ, quãng đường và thời gian di chuyển](images/chuong-4/hinh-4-12-trip-planner-ket-qua.jpg)

*Hình 4.12: Lịch trình hoàn chỉnh kèm lộ trình trên bản đồ, quãng đường và thời gian di chuyển*


**Phân hệ Nhà cung cấp (`/provider`)**

| Đường dẫn | Màn hình | Chức năng chính |
|---|---|---|
| `/provider` | Dashboard | Doanh thu, số đơn, đơn gần đây |
| `/provider/profiles` | Hồ sơ doanh nghiệp | Tạo / sửa hồ sơ, liên kết PayPal, chữ ký điện tử, theo dõi trạng thái duyệt |
| `/provider/tours`, `/provider/hotels`, `/provider/restaurants` | Quản lý dịch vụ | Danh sách, tạo mới, chỉnh sửa, tạm dừng / mở bán |
| `/provider/bookings/{tours,hotels,restaurants}` | Quản lý đơn | Xác nhận, hủy (hoàn tiền), đánh dấu hoàn thành (chi trả), hóa đơn |
| `/provider/calendar/[service]` | Lịch phục vụ | Lịch tháng hiển thị đơn theo ngày |
| `/provider/reviews/*` | Đánh giá | Xem đánh giá của khách theo từng loại dịch vụ |
| `/provider/reports` | Báo cáo | Biểu đồ doanh thu, xuất Excel |

![Hình 4.13: Bảng điều khiển của nhà cung cấp](images/chuong-4/hinh-4-13-ncc-dashboard.jpg)

*Hình 4.13: Bảng điều khiển của nhà cung cấp*

![Hình 4.14: Chi tiết hồ sơ doanh nghiệp, tài khoản PayPal nhận tiền và chữ ký hóa đơn](images/chuong-4/hinh-4-14-ncc-ho-so-doanh-nghiep.jpg)

*Hình 4.14: Chi tiết hồ sơ doanh nghiệp, tài khoản PayPal nhận tiền và chữ ký hóa đơn*

![Hình 4.15: Quản lý danh sách tour](images/chuong-4/hinh-4-15-ncc-quan-ly-tour.jpg)

*Hình 4.15: Quản lý danh sách tour*

![Hình 4.16: Biểu mẫu tạo tour mới theo từng bước](images/chuong-4/hinh-4-16-ncc-tao-tour.jpg)

*Hình 4.16: Biểu mẫu tạo tour mới theo từng bước*

![Hình 4.17: Danh sách đơn đặt tour của nhà cung cấp](images/chuong-4/hinh-4-17-ncc-don-dat.jpg)

*Hình 4.17: Danh sách đơn đặt tour của nhà cung cấp*

![Hình 4.18: Chi tiết đơn đặt và tổng quan tài chính (phí sàn, số tiền thực nhận)](images/chuong-4/hinh-4-18-ncc-chi-tiet-don.jpg)

*Hình 4.18: Chi tiết đơn đặt và tổng quan tài chính (phí sàn, số tiền thực nhận)*

![Hình 4.19: Lịch đặt chỗ theo tháng](images/chuong-4/hinh-4-19-ncc-lich.jpg)

*Hình 4.19: Lịch đặt chỗ theo tháng*

![Hình 4.20: Thống kê và danh sách đánh giá của khách hàng](images/chuong-4/hinh-4-20-ncc-danh-gia.jpg)

*Hình 4.20: Thống kê và danh sách đánh giá của khách hàng*

![Hình 4.21: Báo cáo và thống kê doanh thu của nhà cung cấp](images/chuong-4/hinh-4-21-ncc-bao-cao.jpg)

*Hình 4.21: Báo cáo và thống kê doanh thu của nhà cung cấp*


**Phân hệ Quản trị viên (`/admin`)**

| Đường dẫn | Màn hình | Chức năng chính |
|---|---|---|
| `/admin` | Dashboard | GMV, doanh thu hoa hồng, người dùng mới, biểu đồ tổng quan |
| `/admin/profile-approval` | Duyệt hồ sơ | Danh sách hồ sơ chờ duyệt, xem chi tiết, phê duyệt / từ chối kèm lý do |
| `/admin/users` | Người dùng | Tìm kiếm, xem chi tiết, khóa / mở khóa tài khoản |
| `/admin/destinations` | Điểm đến | Thêm / sửa điểm đến, tọa độ, ảnh, xuất bản |
| `/admin/articles` | Bài viết | Trình soạn thảo Tiptap, nháp / xuất bản, quản lý bình luận |
| `/admin/moderation` | Kiểm duyệt | Hàng chờ nội dung `pending`, lý do và độ tin cậy của AI, thống kê kiểm duyệt |
| `/admin/reports` | Báo cáo | Thống kê theo thời gian, xuất Excel |
| `/admin/settings` | Cấu hình | Hoa hồng, tỷ giá, thời gian giữ chỗ, hạn hủy, thông tin trang giới thiệu |

![Hình 4.22: Bảng điều khiển quản trị: GMV, hoa hồng, tỷ trọng đơn theo dịch vụ](images/chuong-4/hinh-4-22-admin-dashboard.jpg)

*Hình 4.22: Bảng điều khiển quản trị: GMV, hoa hồng, tỷ trọng đơn theo dịch vụ*

![Hình 4.23: Danh sách hồ sơ đối tác chờ duyệt](images/chuong-4/hinh-4-23-admin-duyet-ho-so.jpg)

*Hình 4.23: Danh sách hồ sơ đối tác chờ duyệt*

![Hình 4.24: Chi tiết hồ sơ đối tác và thao tác duyệt / từ chối](images/chuong-4/hinh-4-24-admin-chi-tiet-ho-so.jpg)

*Hình 4.24: Chi tiết hồ sơ đối tác và thao tác duyệt / từ chối*

![Hình 4.25: Màn hình kiểm duyệt nội dung với phán quyết, danh mục vi phạm và lý do của AI](images/chuong-4/hinh-4-25-admin-kiem-duyet.jpg)

*Hình 4.25: Màn hình kiểm duyệt nội dung với phán quyết, danh mục vi phạm và lý do của AI*

![Hình 4.26: Quản lý bài viết cẩm nang](images/chuong-4/hinh-4-26-admin-bai-viet.jpg)

*Hình 4.26: Quản lý bài viết cẩm nang*

![Hình 4.27: Trình soạn thảo bài viết (Tiptap)](images/chuong-4/hinh-4-27-admin-soan-bai-viet.jpg)

*Hình 4.27: Trình soạn thảo bài viết (Tiptap)*

![Hình 4.28: Quản lý điểm đến du lịch](images/chuong-4/hinh-4-28-admin-dia-diem.jpg)

*Hình 4.28: Quản lý điểm đến du lịch*

![Hình 4.29: Quản lý người dùng](images/chuong-4/hinh-4-29-admin-nguoi-dung.jpg)

*Hình 4.29: Quản lý người dùng*

![Hình 4.30: Báo cáo và thống kê toàn sàn](images/chuong-4/hinh-4-30-admin-bao-cao.jpg)

*Hình 4.30: Báo cáo và thống kê toàn sàn*

![Hình 4.31: Cấu hình tham số vận hành: hoa hồng, tỷ giá, thời gian giữ chỗ, hạn hủy](images/chuong-4/hinh-4-31-admin-cau-hinh.jpg)

*Hình 4.31: Cấu hình tham số vận hành: hoa hồng, tỷ giá, thời gian giữ chỗ, hạn hủy*

Toàn bộ giao diện được xây dựng theo hướng đáp ứng đa thiết bị bằng các điểm ngắt của Tailwind CSS: bố cục lưới, thanh điều hướng và bảng dữ liệu tự điều chỉnh theo độ rộng màn hình từ điện thoại tới máy tính để bàn.

---

## 4.6. Triển khai hệ thống

### 4.6.1. Mô hình triển khai

```mermaid
flowchart LR
    Dev["Máy phát triển<br/>bun run dev :2612"] -- git push --> GH["GitHub<br/>(main + nhánh tính năng)"]
    GH -- "tự động build & deploy" --> V

    subgraph V["Vercel"]
        Edge["Mạng biên<br/>tài nguyên tĩnh"]
        Fn["Hàm không máy chủ<br/>Next.js (SSR, Actions, API)"]
        Cron["Cron Jobs<br/>00:00 giờ VN hằng ngày"]
        OIDC["Vercel OIDC"]
    end

    User(["Người dùng"]) -- HTTPS --> Edge --> Fn
    Cron -- "Bearer CRON_SECRET" --> Fn

    Fn --> PG[("PostgreSQL đám mây<br/>serverless")]
    Fn --> PC[("Pinecone<br/>index 768 chiều, 4 namespace")]
    Fn --> IK["ImageKit CDN"]
    Fn --> PP["PayPal REST API"]
    PP -- "Webhooks" --> Fn
    Fn --> GM["Google Maps Platform<br/>Places (New) + Routes"]
    OIDC -- "Workload Identity Federation" --> GCP["Google Cloud<br/>Vertex AI (Gemini)"]
    Fn --> GCP
    Fn --> LF["Langfuse Cloud"]
```

Phiên bản triển khai của hệ thống được công khai tại địa chỉ **https://datn-eta-one.vercel.app**.

### 4.6.2. Cấu hình môi trường

Toàn bộ thông tin kết nối và bí mật được cấu hình qua biến môi trường (mẫu tại `.env.example`), không ghi trong mã nguồn:

| Nhóm | Biến môi trường | Ghi chú |
|---|---|---|
| CSDL | `DATABASE_URL` | Chuỗi kết nối PostgreSQL |
| Xác thực | `AUTH_SECRET`, `AUTH_TRUST_HOST` | Khóa ký JWT (sinh bằng `openssl rand -base64 32`) |
| Vector | `PINECONE_API_KEY`, `PINECONE_INDEX`, `PINECONE_NAMESPACE_*` | Index 768 chiều, độ đo cosine |
| Mô hình nhúng | `GOOGLE_GENERATIVE_AI_API_KEY` | Gọi `gemini-embedding-001` |
| Vertex AI | `GOOGLE_VERTEX_PROJECT`, `GOOGLE_VERTEX_LOCATION`, `GCP_WORKLOAD_IDENTITY_PROVIDER`, `GCP_SERVICE_ACCOUNT_EMAIL` | Location `global` cho mô hình Gemini 3 bản preview |
| Bản đồ | `GOOGLE_MAPS_API_KEY` | Bật Places API (New) và Routes API |
| Thanh toán | `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_MODE`, `PAYPAL_WEBHOOK_ID`, `PAYPAL_REDIRECT_URI` | `PAYPAL_MODE = sandbox` khi thử nghiệm |
| Ảnh | `IMAGEKIT_PUBLIC_KEY`, `IMAGEKIT_PRIVATE_KEY`, `IMAGEKIT_URL_ENDPOINT` | |
| Vận hành | `CRON_SECRET`, `APP_URL` | |
| Giám sát | `LANGFUSE_PUBLIC_KEY`, `LANGFUSE_SECRET_KEY`, `LANGFUSE_BASE_URL` | Để trống thì tắt giám sát |

### 4.6.3. Quy trình triển khai

**Bước 1 – Chuẩn bị các dịch vụ đám mây**

1. Tạo CSDL PostgreSQL đám mây, lấy chuỗi kết nối.
2. Tạo index Pinecone 768 chiều, độ đo `cosine`.
3. Trên Google Cloud: bật Vertex AI API, Places API (New), Routes API; tạo khóa API Google Maps có giới hạn API được phép gọi; tạo tài khoản dịch vụ có quyền *Vertex AI User*.
4. Cấu hình **Workload Identity Federation**: tạo Workload Identity Pool và Provider kiểu OIDC tin cậy nhà phát hành `https://oidc.vercel.com/<team>`, cấp quyền mạo danh tài khoản dịch vụ cho danh tính từ dự án Vercel.
5. Trên PayPal Developer: tạo ứng dụng (Sandbox / Live), bật *Payouts* và *Log in with PayPal*; đăng ký URL webhook `https://<domain>/api/paypal/webhooks` với các sự kiện `PAYMENT.PAYOUTS-ITEM.*`, `PAYMENT.PAYOUTSBATCH.DENIED`, `PAYMENT.CAPTURE.REFUNDED`, `PAYMENT.REFUND.PENDING`, `PAYMENT.REFUND.FAILED`; lưu Webhook ID.
6. Tạo tài khoản ImageKit và Langfuse, lấy khóa truy cập.

**Bước 2 – Khởi tạo CSDL và dữ liệu**

```bash
bun install                    # cài đặt thư viện
bunx prisma migrate deploy     # áp dụng toàn bộ migration, tạo bảng
bun run db:seed                # dữ liệu mẫu Ninh Bình, Hải Phòng + tài khoản quản trị
bun run db:embed               # sinh vector cho toàn bộ dịch vụ, điểm đến và đẩy lên Pinecone
```

**Bước 3 – Triển khai lên Vercel**

1. Kết nối kho mã GitHub với một dự án Vercel; Vercel tự nhận diện Next.js và dùng lệnh `bun run build` (gồm `prisma generate && next build`).
2. Khai báo các biến môi trường ở mục 4.6.2 cho môi trường Production và Preview.
3. Bật *OIDC Federation* trong cài đặt bảo mật của dự án Vercel để hàm máy chủ nhận được mã thông báo OIDC.
4. Mỗi lần hợp nhất mã vào nhánh `main`, Vercel tự động build và cập nhật bản Production; các nhánh tính năng có URL xem trước riêng để kiểm tra trước khi hợp nhất.
5. Vercel đọc `vercel.json` và đăng ký ba Cron Job dọn dữ liệu chạy lúc `0 17 * * *` (UTC).

**Bước 4 – Kiểm tra sau triển khai**

- Đăng nhập tài khoản quản trị, kiểm tra cấu hình hệ thống.
- Thực hiện một luồng đặt tour và thanh toán bằng tài khoản PayPal Sandbox, kiểm tra trạng thái đơn và sự kiện webhook.
- Gửi câu hỏi tới Roamly AI, lập thử một lịch trình và kiểm tra trace tương ứng trên Langfuse.

### 4.6.4. Quy trình phát triển và quản lý mã nguồn

Mã nguồn được quản lý bằng Git trên GitHub theo quy trình nhánh tính năng (feature branch): mỗi chức năng lớn (bài viết, kiểm duyệt nội dung, tìm kiếm ngữ nghĩa và gợi ý...) được phát triển trên một nhánh riêng, mở Pull Request và hợp nhất vào `main` sau khi kiểm tra trên bản xem trước của Vercel. Thông điệp commit tuân theo quy ước *Conventional Commits* (`feat:`, `fix:`, `docs:`...). Thay đổi lược đồ CSDL luôn đi kèm tệp migration của Prisma trong cùng commit để đảm bảo CSDL của mọi môi trường đồng bộ với mã nguồn. Công cụ ESLint (cấu hình `eslint-config-next`) và trình biên dịch TypeScript được dùng để kiểm tra chất lượng mã trước khi hợp nhất.

---

## 4.7. Tổng kết chương

Chương 4 đã trình bày toàn bộ quá trình phát triển và triển khai hệ thống Roamly:

- **Về kiến trúc:** hệ thống được tổ chức thành bốn tầng `app → features → entities → lib` với quy tắc phụ thuộc một chiều, tách biệt rõ giao diện, nghiệp vụ, truy cập dữ liệu và tích hợp dịch vụ ngoài.
- **Về dữ liệu và nghiệp vụ:** CSDL quan hệ khoảng 30 bảng với máy trạng thái đơn đặt rõ ràng; cơ chế giữ chỗ bằng cập nhật có điều kiện, nhả chỗ lười với `FOR UPDATE SKIP LOCKED` loại bỏ hoàn toàn tình trạng bán vượt; luồng tiền ký quỹ – hoàn tiền – chi trả qua PayPal được bảo vệ bằng khóa dòng, xác thực chữ ký webhook và xử lý lũy đẳng.
- **Về Trí tuệ nhân tạo:** chatbot RAG với các công cụ neo dữ liệu thực tế và quy tắc chống ảo tưởng; Trip Planner theo mô hình "AI đề xuất – mã kiểm tra – AI tự sửa" kết hợp thuật toán tối ưu lộ trình trên ma trận thời gian thực tế; tìm kiếm ngữ nghĩa có ngưỡng tương đối; gợi ý cá nhân hóa theo vector hồ sơ; kiểm duyệt hai tầng với nguyên tắc chuyển con người quyết định khi AI không chắc chắn; toàn bộ được giám sát qua Langfuse.
- **Về triển khai:** hệ thống chạy trên Vercel kết nối các dịch vụ đám mây, xác thực tới Vertex AI không dùng khóa tĩnh, triển khai liên tục từ GitHub và đã được công khai trên Internet.

Chương tiếp theo sẽ trình bày kết quả kiểm thử và đánh giá hệ thống, bao gồm kiểm thử chức năng, hiệu năng và chất lượng của các thành phần AI.
