/* 
    1.  To create a new seed template, add an object to formSeeds Array.

    2.  format:
     title: "(title)",
     description: "(Description)",
     content: `(Add markdown form content in here within string literal - If you add variables, encase them in double curly braces like this {{firstName}} )`,
     category: "choose one the appropriate categories (contract), (proposal), (invoice), (agreement), (other) ",
    isTemplate: true (Boolean),
    variables: [
    (add variables you used in form)
      "firstName",
      "lastName",
      "fullName",
      "email",
      "phone",
      "businessName",
      "businessEmail",
      "businessPhone",
      "billingAddress"
      "preferredContact",
      "serviceDesired",
      "estimatedBudget",
      "billedAmount",
      "paidAmount",
      "remainingBalance",
      "currentDate",
      "createdAt"
        ],
    },
*/
const formSeeds = [
  {
    title: "Independent Developer Contract",
    description: "A comprehensive contract, courtesy of Vish Singh",
    content: `# INDEPENDENT DEVELOPER CONTRACT

This Independent Developer Contract (the "Contract") is made as of {{currentDate}} between {{businessName}} with its principal place of business located at {{billingAddress}} (the "Client") and [DEVELOPER NAME], located at [DEVELOPER PLACE OF BUSINESS] (the "Developer").

**WHEREAS**, Client requests the Developer to perform services for it and may request the Developer to perform other services in the future; and

**WHEREAS**, the Client and the Developer desire to enter into a contract, which will define respective rights and duties as to all services to be performed;

**NOW, THEREFORE**, in consideration of covenants and agreements contained herein, the parties hereto agree as follows:

## 1. Services

Effective [SERVICES COMMENCEMENT DATE] Client shall retain the Developer and the Developer shall provide Client with services (the "Services"), which shall include, without limitation:

**DESCRIBE SERVICES OR REFERENCE ATTACHMENT HERE.**

### Timeframe
The Developer will use commercially reasonable efforts to perform the Services within the schedule outlined in Services above. The Developer's delivery timeframe depends upon the Client's prompt response to any questions or requests for Client materials.

### Testing & Acceptance
The Developer shall use commercially reasonable efforts to test deliverables before providing them to the Client.

The Client shall promptly review all deliverables, and must notify the Developer of any failure to conform to the Services within 5 business days of receipt. If the Developer does not receive a timely notification, the deliverable will be deemed accepted. The Client's notification must clearly identify the problems with the Deliverable.

### Client Responsibilities
Client must promptly: (a) coordinate any decision-making activities with 3rd parties; (b) provide Client Content in a form suitable for reproduction or incorporation into the Deliverables; and (c) proofread deliverables.

### Client Representations
Client represents and warrants to the Developer that:
* Client owns sufficient right, title, and interest in the Client Content to permit the Developer's use of the Client Content in performing the Services,
* To the best of Client's knowledge, the Developer's use of the Client Content will not infringe the rights of any third party,
* Client shall comply with the terms and conditions of any licensing agreements which govern the use of Third Party Materials, and
* Client shall comply with all laws and regulations governing the Services and Deliverables.

### Developer Representations
The Developer represents and warrants to Client that:
* The final deliverables will be the Developer's original creative work, except that the Developer may incorporate Client Content, work from their Developer Agents and third party material (for example, stock photos, or Software as a Service).
* For any final deliverable that includes the work of independent developers or third party material, the Developer shall secure sufficient rights for Client to use the final deliverables for their intended purpose.
* To the best of the Developer's knowledge, the final deliverables will not infringe upon the IP rights of any third party. However, the Developer will not be conducting any type of IP clearance search (for example, the Developer will not be conducting a copyright, trademark, patent or design patent clearance search).

## 2. Changes

(a) **Change Requests.** The Client, without invalidating this Contract, may request changes in the work within the general scope of the Contract consisting of additions, deletions, or other revisions.

(b) **Adjustments to Compensation.** In the event that any such changes materially impact the cost to the Developer of performing the Services or the time required for such performance, the parties shall negotiate in good faith a reasonable and equitable adjustment in the applicable Fees and schedule, as applicable.

(c) **New Scope.** If the Change Request alters the scope of the project by more than 20%, the Developer may submit a new proposal to the Client.

## 3. Compensation

### Project Rate Option
(a) **Project Amount.** The work performed by the Developer shall be performed at the rate set forth below, and not exceed the total estimated amount specified below:

Project fee: $ {{estimatedBudget}}  
Additional hourly rate (if requested by the company for additional work or changes): [PROJECT HOURLY RATE]

(b) **Payment.** Invoices shall be issued to Client by the Developer. 40% of the project fee will be paid at the start of the project. 40% will be paid upon successful completion of the project. The remaining 20% shall be paid following final implementation of the project including any agreed upon training, documentation, debugging, app store submission, store approval and testing. All payments shall be due 14 business days after receipt of invoices.

(c) **Taxes.** Client shall not be responsible for federal, state and local taxes derived from the Developer's net income or for the withholding and/or payment of any federal, state and local income and other payroll taxes, workers' compensation, disability benefits or other legal requirements applicable to the Developer.

## 4. Expenses

(a) **Payment.** A Client shall reimburse the Developer for all pre-approved, reasonable and necessary expenses, including, without limitation, domestic and foreign travel, lodging and meal expenses incurred in connection with the Services.

(b) **Substantiation.** The Developer shall provide Client with documentation supporting all expenses.

(c) **Payment.** Client shall reimburse the Developer within 14 days upon receipt of a request for reimbursement from the Developer.

## 5. Client Rights in Deliverables

(a) **IP Assignment.** Upon completion of the Services and full payment of all invoices, the Developer shall assign IP rights to the Client. These IP rights include all ownership rights, including any copyrights, in any artwork, designs and software created by the Developer and incorporated into a final deliverable, except as otherwise noted in this Contract.

## 6. Developer Rights in Deliverables

(a) **Preliminary Works.** The Developer retains the rights to all preliminary works that are not incorporated into a final deliverable.

(b) **Developer Portfolio.** The Developer may display the deliverables in the Developer's portfolios and websites, and in galleries, design periodicals and other exhibits for the purposes of professional recognition. Likewise, the Developer may publicly describe their role in the project.

(c) **Credit.** If the Developer incorporates credits into the deliverables, any use of the deliverables shall continue to bear the credits in the same form, size and location. Developer credits will not be incorporated into any logo designed for the Client.

(d) **Developer Tools.** The Developer may incorporate certain Developer Tools into the deliverables.
   
   (i) "Developer Tools" means all programming, deployment, database or design tools developed or utilized by the Developer in performing the Services, including without limitation: pre-existing and newly developed software, web authoring tools, type fonts, and application tools.
   
   (ii) In the event Developer Tools are incorporated into any final deliverable, then the Developer grants Client a royalty-free, perpetual, worldwide, non-exclusive license to use the Developer Tools to the extent necessary to use the final deliverables. The Developer retains all other rights in the Developer Tools.

## 7. Independent Contractor Status

(a) **Status.** The Developer is an independent contractor of Client. Nothing contained in this Contract shall be construed to create the relationship of employer and employee, principal and agent, partnership or joint venture, or any other fiduciary relationship.

(b) **No Authority.** The Developer shall have no authority to act as agent for, or on behalf of, Client, or to represent Client, or bind Client in any manner.

(c) **No Employee Benefits.** The Developer shall not be entitled to worker's compensation, retirement, insurance or other benefits afforded to employees of Client.

## 8. Developer and Client Relationship

(a) **Non-Exclusive.** This Contract does not create an exclusive relationship. The deliverables are not a "work for hire" under Copyright Law.

(b) **No Assignment.** Neither party may assign its rights or obligations under this Contract without the prior written consent of the other party. Any such attempted assignment will be void ab initio. Consent is not required for a disposition of substantially all assets of the assigning party's business.

## 9. Representations and Warranties
The Client and the Developer respectively represents and warrants to each other that each respectively is fully authorized and empowered to enter into the Contract and that their entering into the Contract and to each parties' knowledge the performance of their respective obligations under the Contract will not violate any agreement between the Client or the Developer respectively and any other person, firm or organization or any law or governmental regulation.

## 10. Confidential Information
Each party shall maintain Confidential Information in strict confidence, and shall not use Confidential Information except (a) as necessary to perform its obligations under the Contract, or (b) as required by a court or governmental authority. Confidential Information includes proprietary technical and business information, preliminary works, and any other information marked "Confidential."

**Exception.** Confidential Information does not include (a) any information that is in the public domain, (b) becomes publicly known through no fault of the receiving party, or (c) is otherwise known by the receiving party before obtaining access to it under this Contract or properly received from a third party without an obligation of confidentiality.

## 11. Intellectual Property

(a) **Work Product.** During the course of performing the Services, the Developer and their directors, officers, employees, or other representatives may, independently or in conjunction with Client, develop information, produce work product, or achieve other results for Client in connection with the Services it performs for Client.

(b) **Ownership.** The Developer agrees that such information, work product, and other results, systems and information developed by the Developer and/or Client in connection with such Services (hereinafter referred to collectively as the "Work Product") shall, to the extent permitted by law, be a "work made for hire" within the definition of Section 101 of the Copyright Act (17 U.S.C. 101), and shall remain the sole and exclusive property of Client.

(c) **Assignment of Interest.** To the extent any Work Product is not deemed to be a work made for hire within the definition of the Copyright Act, the Developer with effect from creation of any and all Work Product, hereby assigns, and agrees to assign, to Client all right, title and interest in and to such Work Product, including but not limited to copyright, all rights subsumed thereunder, and all other intellectual property rights, including all extensions and renewals thereof.

(d) **Moral Rights.** The Developer also agrees to waive any and all moral rights relating to the Work Product, including but not limited to, any and all rights of identification of authorship and any and all rights of approval, restriction or limitation on use, and subsequent modifications.

(e) **Assistance.** The Developer further agrees to provide all assistance reasonably requested by Client, both during and subsequent to the Term of this Contract, in the establishment, preservation and enforcement of Client's rights in the Work Product.

(f) **Return of Property.** Upon the termination of this Contract, the Developer agrees to deliver promptly to Client all printed, electronic, audio-visual, and other tangible manifestations of the Work Product, including all originals and copies thereof.

## 12. Non-Solicitation

(a) During the term of this Contract, and for a period of 1 year after its expiration, Client shall not solicit any of the Developer's employees or Design Agents (collectively, "Developer Employee") without the prior written consent of the Developer. "Solicit" is defined to include: solicit, recruit, engage, or otherwise employ or retain, on a full-time, part-time, consulting, work-for-hire, or any other basis.

(b) During the term of this Contract, and for a period of 1 year after its expiration, the Developer shall not solicit any of Client's employees or customers without the prior written consent of the Client. "Solicit" is defined to include: solicit, recruit, engage, or otherwise employ or retain, on a full-time, part-time, consulting, work-for-hire, or any other basis.

(c) **Agency Commission.** In the event of such Solicitation, Client shall pay the Developer an agency commission of 25% of the Developer Employee's starting salary with Client, or if hired as a contractor, 25% of the total contract fees paid to Developer Employee during the first year following the Solicitation.

## 13. Term
This Contract shall commence on the date and year first above written and shall continue for a period of 1 year unless earlier terminated in accordance with this Contract.

## 14. Termination

(a) **Discretionary Termination, Upon Notice.** Either party may terminate this contract in its business discretion upon sufficient advance notice. The amount of notice required is 1/4 of the estimated project duration. For example, if the Statement of Work estimates the services will take 80 days from kick-off to final delivery, advance notice of at least 20 days will be sufficient for discretionary termination.

(b) **Discretionary Termination by Client.** IF: Client uses this discretionary termination provision, THEN: The Developer will retain all payments already made as of the notification date, and Client shall pay the Developer (a) for all expenses incurred as of the date of notification of termination, (b) an early termination fee equal to 25% of the total project fee, and (c) No IP rights will be transferred.

(c) **Discretionary Termination by Developer.** IF: The Developer uses this discretionary termination provision, THEN: (a) The Developer will retain (or, if not paid in advance, will be due) all costs already incurred and a prorated portion of the fees for services performed up to the termination date, (b) The Developer will assist Client in transferring the project to a new developer, and (c) The Developer will assign sufficient IP rights to Client to allow Client to continue the project.

(d) **Termination for Bankruptcy.** Subject to any restrictions imposed by law, either party may immediately terminate this Contract, if the other party either: (1) ceases to do business in the normal course; (2) becomes insolvent; (3) admits in writing its inability to meet its debts or other obligations as they become due; (4) makes a general assignment for the benefit of creditors; (5) has a receiver appointed for its business or assets; (6) files a voluntary petition for protection under the bankruptcy laws; (7) becomes the subject of an involuntary petition under the bankruptcy laws that is not dismissed within 60 days.

(e) **Termination for Breach.** If a material breach of this Contract is not cured within 10 business days after a party's receiving notice of the breach, then the non-breaching party may terminate this Contract immediately upon notice.

(f) **Termination Procedure.** Upon expiration or termination of this Contract: (a) each party shall return (or, at the disclosing party's request, destroy) the Confidential Information of the other party, and (b) other than as expressly provided in this Contract, all rights and obligations of each party under this Contract, exclusive of the Services, shall survive.

## 15. Limitation of Liability
The services and the work product of the Developer are sold "as is." In all circumstances, the Developer's maximum liability to Client for damages for any and all causes whatsoever, and Client's maximum remedy, regardless of the form of action, whether in contract, tort or otherwise, shall be limited to the Developer's net profit.

In no event shall the Developer be liable for any lost data or content, lost profits, business interruption or for any indirect, incidental, special, consequential, exemplary or punitive damages arising out of or relating to the materials or the services provided by the Developer, even if the Developer has been advised of the possibility of such damages.

## 16. Limited Warranty
Except for the express representations and warranties stated in this contract, the Developer makes no warranties whatsoever. The Developer explicitly disclaims any other warranties of any kind, either express or implied, including but not limited to warranties of merchantability or fitness for a particular purpose or compliance with laws or government rules or regulations applicable to the project.

## 17. Force Majeure
Either party may invoke Force Majeure to excuse the failure of its timely performance, if such failure was caused by: fire; flood; hurricane, tornado, or other severe storm; earthquake; act of war; sabotage; terrorism; riot; interruption or failure of electrical or telecommunications service (for example, Internet failures); or failure of suppliers, subcontractors, and carriers to substantially meet their performance obligations.

Failure to make a payment may only be considered a Force Majeure event if caused by an interruption in a third-party payment system that otherwise qualifies as a force-majeure event.

A party invoking force majeure to excuse its failure of timely performance must show that the force-majeure event(s) and their relevant effects (i) were beyond the invoking party's reasonable control and (ii) could not have been avoided through the exercise of due care by the invoking party.

## 18. Indemnification

(a) **Indemnification by Developer.** The Developer agrees to indemnify and hold harmless Client and its officers, directors, employees and agents, from and against all claims, liabilities, losses, costs, damages, judgments, penalties, fines, attorneys' fees, court costs and other legal expenses, insurance deductibles and all other expenses arising out of or relating to, directly or indirectly, from:
   
   (i) the negligent, grossly negligent, or intentional act or omission of the Developer or their directors, officers, employees, agents or Developers,
   
   (ii) the Developer's failure to perform any of their obligations under this Contract, and
   
   (iii) any act or omission of the Developer in connection with the Work.

(b) **Notification.** Client will promptly notify the Developer of any claim for indemnification.

(c) **Survival.** The Developer's obligations under this Section shall survive termination or expiration of this Contract.

## 19. General Provisions

(a) **Entire Contract.** This Contract constitutes the entire contract between the parties, and supersedes all prior contracts, representations and understandings of the parties, written or oral.

(b) **Counterparts.** This Contract may be executed in counterparts, each of which shall be deemed to be an original, but all of which, taken together, shall constitute one and the same contract.

(c) **Amendment.** This Contract may be amended only by written contract of the parties.

(d) **Notices.** All notices shall be sent by email. Permissible addresses for notice include those stated in this Contract and any other address reasonably communicated.

A notice that is sent by email but is not read by the addressee is nevertheless effective if, but only if, it has been (a) sent from an email account that has been designated for notice and (b) delivered to an email account that has been designated for notice. Email accounts designated for notice are identified at the bottom of this Contract, and may be amended email or written notice.

(e) **Assignment.** This Contract shall not be assigned by either party without the consent of the other party.

(f) **Governing Law.** This Contract shall be governed by and construed in accordance with the laws of the State of [JURISDICTION STATE], without regard to its conflict of laws rules.

(g) **No Waiver of Rights.** A failure or delay in exercising any right, power or privilege in respect of this Contract will not be presumed to operate as a waiver, and a single or partial exercise of any right, power or privilege will not be presumed to preclude any subsequent or further exercise, of that right, power or privilege or the exercise of any other right, power or privilege.

---

**IN WITNESS WHEREOF**, the Client and the Developer have each executed and delivered this Contract as of {{currentDate}}.

**Signature Page**

<table style="width:100%; border-collapse: collapse;">
  <tr>
    <td style="border: 1px solid black; padding: 10px;"><strong>Developer name</strong>:</td>
    <td style="border: 1px solid black; padding: 10px;"><strong>Client Contact name</strong>:</td>
  </tr>
  <tr>
    <td style="border: 1px solid black; height: 50px;">[DEVELOPER NAME]</td>
    <td style="border: 1px solid black; height: 50px;">{{fullName}}</td>
  </tr>
  <tr>
    <td style="border: 1px solid black; padding: 10px;"><strong>Developer email for Notice</strong>:</td>
    <td style="border: 1px solid black; padding: 10px;"><strong>Client email for Notice</strong>:</td>
  </tr>
  <tr>
    <td style="border: 1px solid black; height: 50px;">[DEVELOPER EMAIL]</td>
    <td style="border: 1px solid black; height: 50px;">{{businessEmail}}</td>
  </tr>
  <tr>
    <td style="border: 1px solid black; padding: 10px;"><strong>Developer signature</strong>:</td>
    <td style="border: 1px solid black; padding: 10px;"><strong>Client Contact signature</strong>:</td>
  </tr>
  <tr>
    <td style="border: 1px solid black; height: 75px;"></td>
    <td style="border: 1px solid black; height: 75px;"></td>
  </tr>
  <tr>
    <td style="border: 1px solid black; padding: 10px;"><strong>Date signed</strong>:</td>
    <td style="border: 1px solid black; padding: 10px;"><strong>Date signed</strong>:</td>
  </tr>
  <tr>
    <td style="border: 1px solid black; height: 50px;"></td>
    <td style="border: 1px solid black; height: 50px;"></td>
  </tr>
</table>
  
  
  
  
  
  
  
  
  
`,
    category: "contract",
    isTemplate: true,
    variables: [
      "businessName",
      "currentDate",
      "billingAddress",
      "estimatedBudget",
      "businessEmail",
      "fullName",
    ],
  },
  {
    title: "California Contract Killer",
    description:
      "A plain language web development contract courtesy of: https://github.com/mapache-salvaje/contract-killer",
    content: `# The Contract 
 
### Date: {{currentDate}}  
#### Between: **(Developer)**  
  
#### And {{businessName}}  
   
## Summary:  
I will always do my best to fulfill your needs and meet your expectations, but it's important to have things written down so that we both know what's what, who should do what and when, and what will happen if something goes wrong.  
  
In this contract you won't find any complicated legal terms or long passages of unreadable text. I would never want to trick you into signing something that you might later regret. What I do want is what's best for both parties, now and in the future.  
  
In short;  
  
("You"), {{businessName}}, located at:  
  
{{billingAddress}}  
  
 are hiring me ("Me") (Developer) for: 
##### {{serviceDesired}}  
  
For the estimated total price of {{estimatedBudget}} as outlined in our previous correspondence.  
  
## What do both parties agree to?
**You**: You have the authority to enter into this contract on behalf of yourself, your company or your organization. You will give me the assets and information that I tell you I need to complete the project. You'll do this when I ask and provide it in the formats I ask for. You'll review my work, provide feedback and approval in a timely manner too. We will both be bound by dates we set together. You also agree to stick to the payment schedule set out at the end of this contract.  
  
**Me**: I have the experience and ability to do everything I've discussed with you and I will do it all in a professional and timely manner. I will do my best to meet every deadline that's set, and I will maintain the confidentiality of everything you give me.  
  
## Design
I create designs that adapt to the capabilities of many devices and screen sizes. I create them iteratively using HTML and CSS, and it would be a poor use of my time to mock up every template as a static visual. I may use visuals to indicate a creative direction (color, texture and typography).  
  
You will have plenty of opportunities to review my work and provide feedback. I will share a Github repository and development site with you and we will have regular contact via phone, email, or any video chat provider we agree to, such as Zoom or Skype.  
  
If, at any stage, you change your mind about what you want delivered or aren't happy with the direction my work is taking, you will pay me in full for the time I've spent working until that point and may terminate this contract.  
  
## Text content  
Unless agreed separately, I am not responsible for inputting text or images into your content management system or creating every page on your website. I do provide professional copywriting and editing services, so if you'd like me to create new content or input content for you, I will provide a separate estimate.  
  
## Graphics and photographs
You should supply graphic files in an editable, vector digital format. You should supply photographs in a high resolution digital format. If you choose to buy stock photographs, I can suggest stock libraries. If you'd like me to search for photographs for you, I can provide a separate estimate.  

## HTML, CSS and JavaScript
I deliver pages developed from HTML markup, CSS stylesheets for styling and JavaScript for behavior.  
  
## Browser testing
Browser testing no longer means attempting to make a website look the same in browsers of different capabilities or on devices with different size screens. It does mean ensuring that a person's experience of a design should be appropriate to the capabilities of a browser or device.  
  
I test my work in current versions of major desktop browsers including those made by Apple (Safari), Google (Chrome), Microsoft (Edge), and Mozilla Firefox. I will not test in other older browsers unless we agreed separately. If you need an enhanced design for an older browser, I can provide a separate estimate for that.  
  
## Mobile browser testing
Testing using popular smaller screen devices is essential in ensuring that a person's experience of a design is appropriate to the capabilities of the device they're using. I test my designs in:  
  
iOS: Safari and Google Chrome  
Android: Google Chrome  
  
I will not test in Opera Mini/Mobile, specific Android devices, or other mobile browsers.  
  
## Technical support
I am not a website hosting company so I do not offer support for website hosting, email or other services relating to hosting. You may already have professional hosting. If you don't, I will recommend one of my preferred hosting providers. I can set up your site on a server if you'd like, and will provide a separate estimate for that. Then, the updates to, and management of that server will be up to you.  
  
For most projects, I prefer a serverless solution to save us both time and money. This means your website is hosted in the cloud and so there is no need for server management. I will recommend this option when I feel it is appropriate.  
  
## Search engine optimization (SEO)
I do not guarantee improvements to your website's search engine ranking, but the pages that I develop are accessible to search engines. I do offer search engine optimization services, and can provide a separate estimate for that.  

## Changes and revisions
I do not want to limit your ability to change your mind. The price at the beginning of this contract is based on the amount of time that I estimate I'll need to accomplish everything you've told me you want to achieve, but I'm happy to be flexible. If you want to change your mind or add anything new, that won't be a problem as I will provide a separate estimate for the additional time.  

## Legal stuff
I will carry out my work in accordance with good industry practice and at the standard expected from a suitably qualified person with relevant experience. That said, I can't guarantee that my work will be error-free and so I can't be liable to you or any third party for damages, including lost profits, lost savings or other incidental, consequential or special damages, even if you've advised me of them.  
  
Your liability to me will also be limited to the amount of fees payable under this contract and you won't be liable to me or any third party for damages, including lost profits, lost savings or other incidental, consequential or special damages, even if I've advised you of them.  
  
Finally, if any provision of this contract shall be unlawful, void, or for any reason unenforceable, then that provision shall be deemed severable from this contract and shall not affect the validity and enforceability of any remaining provisions.  
  
## Intellectual property rights
"Intellectual property rights" means all patents, rights to inventions, copyright (including rights in software) and related rights, trademarks, service marks, get up and trade names, internet domain names, rights to goodwill or to sue for passing off, rights in designs, database rights, rights in confidential information (including know-how) and any other intellectual property rights, in each case whether registered or unregistered and including all applications (or rights to apply) for, and renewals or extensions of, such rights and all similar or equivalent rights or forms of protection which subsist or shall subsist now or in the future in any part of the world.  
  
First, you guarantee that all elements of text, images or other artwork you provide are either owned by you, or that you have permission to use them. When you provide text, images or other artwork to me, you agree to protect me from any claim by a third party that I'm using their intellectual property.  
  
I guarantee that all elements of the work I deliver to you are either owned by me or I've obtained permission to provide them to you. When I provide text, images or other artwork to you, I agree to protect you from any claim by a third party that you're using their intellectual property. Provided you've paid for the work and that this contract hasn't been terminated, I will assign all intellectual property rights to you as follows:  
  
You'll own the website I design for you plus the visual elements that I create for it. I'll give you source files and finished files and you should keep them somewhere safe as I am not required to keep a copy. You own all intellectual property rights of text, images, site specification and data you provided, unless someone else owns them.  
  
I will own any intellectual property rights I've developed prior to, or developed separately from this project and not paid for by you. I will own the unique combination of these elements that constitutes a complete design and I'll license its use to you, exclusively and in perpetuity for this project only, unless we agree otherwise.  
  
## Displaying my work
I love to show off my work, so I reserve the right to display all aspects of my creative work, including sketches, work-in-progress designs and the completed project on my portfolio and in articles on websites, in magazine articles and in books.  
  
## Payment schedule
You agree to pay for my services as outlined in the following payment schedule:  
  
50% deposit before work begins  
Remaining 50% upon completion  
  
I issue invoices electronically. My payment terms are 30 days from the date of invoice by Venmo or PayPal. All proposals are quoted in US dollars.  
  
I reserve the right to charge interest on all overdue debts at the rate of 5% per month or part of a month.  
  
## The not-so-small print
Neither of us can transfer this contract to anyone else without the other's permission.  
  
We both agree that we'll adhere to all relevant laws and regulations in relation to our activities under this contract and not cause the other to breach any relevant laws or regulations.  
  
This contract stays in place and need not be renewed. If for some reason one part of this contract becomes invalid or unenforceable, the remaining parts of it remain in place.  
  
Although the language is simple, the intentions are serious and this contract is a legally binding document.  
  
## The dotted line  
  
X 
……………………………………………………
Signed by  (Developer), {{currentDate}}  
  
X……………………………………………………
Signed by {{fullName}}, {{currentDate}}  
  
  
  
  
  
  
  
  
  `,
    category: "contract",
    isTemplate: true,
    variables: [
      "businessName",
      "fullName",
      "currentDate",
      "serviceDesired",
      "billedAmount",
      "estimatedBudget",
    ],
  },
  {
    title: "Web Development Proposal",
    description: "Project proposal template for new clients",
    content: `# Web Development Proposal
  
  ## Prepared for {{businessName}}
  
  **Prepared by:** [Developer]
  **Date:** {{currentDate}}
  
  Dear {{fullName}},
  
  Thank you for considering our services for your web development needs. We're excited to present this proposal for {{serviceDesired}}.
  
  ## Project Understanding
  
  Based on our discussions, you need a professional website that will help your business grow online. Your website will include:
  
  - Professional design aligned with your brand
  - Mobile-responsive layout
  - Content management system
  - Contact form
  - Basic SEO optimization
  
  ## Timeline and Milestones
  
  - Discovery and Planning: 1-2 weeks
  - Design Phase: 2-3 weeks
  - Development Phase: 3-4 weeks
  - Testing and Revisions: 1-2 weeks
  - Launch: 1 week
  
  Total estimated timeline: 8-12 weeks from project start date.
  
  ## Investment
  
  Project Fee: {{billedAmount}}
  
  Payment Schedule:
  - 50% deposit to begin work
  - 25% upon design approval
  - 25% upon project completion
  
  ## Next Steps
  
  To proceed with this project, please:
  1. Review this proposal
  2. Sign the attached agreement
  3. Submit the initial deposit
  
  We look forward to working with you on this exciting project!
  
  Regards,
  
  Your Name
  Web Developer
    
    
    
    
    
    
    
    
    
    `,
    category: "proposal",
    isTemplate: true,
    variables: [
      "businessName",
      "fullName",
      "currentDate",
      "serviceDesired",
      "billedAmount",
    ],
  },
  {
    title: "Standard Invoice",
    description: "Standard invoice for client billing",
    content: `# Invoice

**Date: {{currentDate}}**  
**Invoice No. _______**

---

## BILL TO:

{{businessName}} 

### Contact

{{fullName}}
{{phone}}  
{{email}}

| DESCRIPTION | PRICE | SUBTOTAL |
|-------------|-------|----------|
|{{serviceDesired}} | | |
| | | |
| | | |

| SUBTOTAL | TAX (%) | TOTAL AMOUNT |
|----------|-----------|--------------|
| {{billedAmount}} | _______ | **_______** |

---

### Payment Summary

**Total Amount: $_______**  
**Amount Paid: {{paidAmount}}**  
**Remaining Balance: {{remainingBalance}}**

---

### Contact Information

[Your Company Name]  
[Your Company Email]  
[Your Company Phone] 
[Your Company Mailing Address]

---  
  
  
  
  
  
  
  
  
  
  `,
    category: "invoice",
    isTemplate: true,
    variables: [
      "businessName",
      "businessEmail",
      "businessPhone",
      "fullName",
      "currentDate",
      "serviceDesired",
      "billedAmount",
      "paidAmount",
      "remainingBalance",
    ],
  },
  {
    title: "Website Maintenance Agreement",
    description: "Agreement for ongoing website maintenance services",
    content: `# Website Maintenance Agreement
  
  ## Between [Developer] and {{businessName}}
  
  **Date:** {{currentDate}}
  
  This Website Maintenance Agreement is made between [Developer] ("Developer") and {{businessName}} ("Client").
  
  ### 1. Services
  
  Provider agrees to perform the following website maintenance services:
  
  - Regular website updates and content changes
  - Security monitoring and updates
  - Search engine optimization
  - Backup management
  - Technical support
  
  ### 2. Term
  
  This agreement begins on {{currentDate}} and continues for 12 months, with automatic renewal unless terminated by either party with 30 days written notice.
  
  ### 3. Payment
  
  Monthly maintenance fee: $___________
  Billing cycle: Monthly, due on the 1st of each month
  
  ### 4. Response Time
  
  Provider will respond to maintenance requests within 24-48 business hours.
  
  ### 5. Contact Information
  
  Client Name: {{fullName}}
  Client Email: {{email}}
  Client Phone: {{phone}}
  Preferred Contact Method: {{preferredContact}}
  
  ### Signatures
  
  ________________________
  {{fullName}}, {{businessName}}, Client
  
  ________________________
  [Developer]
  
    
    
    
    
    
    
    
    
    
    `,
    category: "agreement",
    isTemplate: true,
    variables: [
      "businessName",
      "fullName",
      "currentDate",
      "email",
      "phone",
      "preferredContact",
      "remainingBalance",
    ],
  },
  {
  title: "Markdown & Variables Guide for Forms",
  description: "Learn how to create and edit your own custom forms with markdown and variables",
  content: `# 📝 Form Template Guide

## Welcome to the Form Builder!

> This template is designed to help you learn how to create and customize your own forms. Feel free to edit this template or use it as a reference when creating new forms.  
> Click the "Edit" button in the form preview screen to start customizing.
> **Note:** This template uses variables to automatically fill in client data. Make sure to replace the placeholders with actual data when using the template.


**Examples:**

Current date: {{currentDate}}

Hello {{fullName}}, welcome to your guide on creating custom forms for {{businessName}}!

---

## 🔄 Using Variables

Variables allow you to automatically insert client data into your forms. Here are some common variables you can use:

### Client Personal Info
- **{{firstName}}** - Client's first name
- **{{lastName}}** - Client's last name
- **{{fullName}}** - Client's full name
- **{{email}}** - Client's personal email
- **{{phone}}** - Client's phone number

### Business Info
- **{{businessName}}** - Business name
- **{{businessEmail}}** - Business email
- **{{businessPhone}}** - Business phone
- **{{billingAddress}}** - Complete billing address

### Project Info
- **{{serviceDesired}}** - Requested service
- **{{estimatedBudget}}** - Client's estimated budget
- **{{billedAmount}}** - Amount billed to client
- **{{paidAmount}}** - Amount client has paid
- **{{remainingBalance}}** - Remaining balance to be paid

### Dates
- **{{currentDate}}** - Current date when form is generated
- **{{createdAt}}** - Date the client was created in system

---

## 📝 Markdown Formatting Guide

### Basic Text Formatting

**Markdown syntax:**
\`\`\`
This is **bold text** and this is *italic text*.
You can also use __bold__ and _italic_ with underscores.
To ~~strikethrough~~ text, use tildes.
\`\`\`

**Result:**
This is **bold text** and this is *italic text*.
You can also use __bold__ and _italic_ with underscores.
To ~~strikethrough~~ text, use tildes.

---

### Headings

**Markdown syntax:**
\`\`\`
# Heading 1
## Heading 2
### Heading 3
#### Heading 4
\`\`\`

**Result:**
# Heading 1
## Heading 2
### Heading 3
#### Heading 4

---

### Lists

**Markdown syntax for unordered lists:**
\`\`\`
* Item 1
* Item 2
  * Nested item
  * Another nested item
* Item 3
\`\`\`

**Result:**
* Item 1
* Item 2
  * Nested item
  * Another nested item
* Item 3

**Markdown syntax for ordered lists:**
\`\`\`
1. First item
2. Second item
3. Third item
\`\`\`

**Result:**
1. First item
2. Second item
3. Third item

---

### Links

**Markdown syntax:**
\`\`\`
<a href="https://www.markdownguide.org" target="_blank">Visit Markdown Guide</a>
\`\`\`

**Result:**
<a href="https://www.markdownguide.org" target="_blank">Visit Markdown Guide</a>

---

### Images

**Markdown syntax:**
\`\`\`
![Alt text for an image](https://images.pexels.com/photos/7927357/pexels-photo-7927357.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1)
\`\`\`

**Result:**
![Alt text for an image](https://images.pexels.com/photos/7927357/pexels-photo-7927357.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1)

---

### Blockquotes

**Markdown syntax:**
\`\`\`
> This is a blockquote.
> It can span multiple lines.
>
> And even multiple paragraphs.
\`\`\`

**Result:**
> This is a blockquote.
> It can span multiple lines.
>
> And even multiple paragraphs.

---

### Code

**Markdown syntax for inline code:**
\`\`\`
Inline \`code\` can be included with backticks.
\`\`\`

**Result:**
Inline \`code\` can be included with backticks.

**Markdown syntax for code blocks:**
\`\`\`\`
\`\`\`
function exampleCode() {
  return "Hello world!";
}
\`\`\`
\`\`\`\`

**Result:**
\`\`\`
function exampleCode() {
  return "Hello world!";
}
\`\`\`

---

### Tables

**Markdown syntax:**
\`\`\`
| Name | Email | Phone |
|------|-------|-------|
| {{firstName}} | {{email}} | {{phone}} |
| Contact 2 | email2@example.com | 555-5678 |
\`\`\`

**Result:**
| Name | Email | Phone |
|------|-------|-------|
| {{firstName}} | {{email}} | {{phone}} |
| Contact 2 | email2@example.com | 555-5678 |

---

### Horizontal Rule

**Markdown syntax:**
\`\`\`
Use three hyphens, asterisks, or underscores:
---
\`\`\`

**Result:**
Use three hyphens, asterisks, or underscores:

---

## 🌐 HTML in Markdown

You can also use HTML for more advanced formatting when markdown isn't enough:

**HTML syntax for custom styled boxes:**
\`\`\`html
<div style="background-color: #f0f0f0; padding: 10px; border-radius: 5px;">
  <h3 style="color: #4361ee;">Custom Styled Box</h3>
  <p>This box uses HTML and inline CSS for custom styling.</p>
</div>
\`\`\`

**Result:**
<div style="background-color: #f0f0f0; padding: 10px; border-radius: 5px;">
  <h3 style="color: #4361ee;">Custom Styled Box</h3>
  <p>This box uses HTML and inline CSS for custom styling.</p>
</div>

**HTML syntax for custom tables:**
\`\`\`html
<table style="width:100%; border-collapse: collapse;">
  <tr style="background-color: #4361ee; color: white;">
    <th style="border: 1px solid black; padding: 10px;">Header 1</th>
    <th style="border: 1px solid black; padding: 10px;">Header 2</th>
  </tr>
  <tr>
    <td style="border: 1px solid black; padding: 10px;">Cell 1</td>
    <td style="border: 1px solid black; padding: 10px;">Cell 2</td>
  </tr>
</table>
\`\`\`

**Result:**
<table style="width:100%; border-collapse: collapse;">
  <tr style="background-color: #4361ee; color: white;">
    <th style="border: 1px solid black; padding: 10px;">Header 1</th>
    <th style="border: 1px solid black; padding: 10px;">Header 2</th>
  </tr>
  <tr>
    <td style="border: 1px solid black; padding: 10px;">Cell 1</td>
    <td style="border: 1px solid black; padding: 10px;">Cell 2</td>
  </tr>
</table>

## 📊 Adding a Signature Box

**HTML syntax for signature table:**
\`\`\`html
<table style="width:100%; border-collapse: collapse; margin-top: 20px;">
  <tr>
    <td style="border: 1px solid black; padding: 10px; width: 50%;">
      <strong>Client Signature</strong><br><br><br>
      ____________________________<br>
      {{fullName}}<br>
      {{businessName}}
    </td>
    <td style="border: 1px solid black; padding: 10px; width: 50%;">
      <strong>Provider Signature</strong><br><br><br>
      ____________________________<br>
      Your Name<br>
      Your Business
    </td>
  </tr>
  <tr>
    <td style="border: 1px solid black; padding: 10px;">
      <strong>Date:</strong> _________________
    </td>
    <td style="border: 1px solid black; padding: 10px;">
      <strong>Date:</strong> _________________
    </td>
  </tr>
</table>
\`\`\`

**Result:**
<table style="width:100%; border-collapse: collapse; margin-top: 20px;">
  <tr>
    <td style="border: 1px solid black; padding: 10px; width: 50%;">
      <strong>Client Signature</strong><br><br><br>
      ____________________________<br>
      {{fullName}}<br>
      {{businessName}}
    </td>
    <td style="border: 1px solid black; padding: 10px; width: 50%;">
      <strong>Provider Signature</strong><br><br><br>
      ____________________________<br>
      Your Name<br>
      Your Business
    </td>
  </tr>
  <tr>
    <td style="border: 1px solid black; padding: 10px;">
      <strong>Date:</strong> _________________
    </td>
    <td style="border: 1px solid black; padding: 10px;">
      <strong>Date:</strong> _________________
    </td>
  </tr>
</table>

---

## 📚 Additional Resources

* <a href="https://www.markdownguide.org" target="_blank">Markdown Guide</a> - Comprehensive markdown reference
* <a href="https://guides.github.com/features/mastering-markdown/" target="_blank">GitHub Markdown</a> - GitHub's markdown guide
* <a href="https://www.markdownguide.org/basic-syntax/#html" target="_blank">HTML in Markdown</a> - Using HTML within markdown

---

**Remember:** When creating templates, focus on clear organization, professional language, and consistency in formatting. You can edit this template by clicking the "Edit" button in the form preview screen.

Give it a try!  
  
  
  
  
  
  
  
  
  
  `,
  category: "other",
  isTemplate: true,
  variables: [
    "firstName",
    "lastName",
    "fullName",
    "email",
    "phone",
    "businessName",
    "businessEmail",
    "businessPhone",
    "billingAddress",
    "preferredContact",
    "serviceDesired",
    "estimatedBudget",
    "billedAmount",
    "paidAmount",
    "remainingBalance",
    "currentDate",
    "createdAt"
  ]
},
{
  title: "Client Proposal",
  description: "Project proposal with three service options, courtesy of Traversy Media",
  content: `# Project Proposal

**From:** [Your Name]  
**Address:** [Your Business Address]  
**Email:** [Your Email]  
**Website:** [Your Website]  

**Date:** {{currentDate}}

---

**To:**  
{{fullName}}  
*Owner*  
{{businessName}}  
{{billingAddress}}

Dear {{firstName}},

Thanks for discussing your business with me. I've compiled 3 options I believe will help achieve the business goals we've discussed for {{serviceDesired}}.

Please review my proposal and let me know if you have any questions or comments. I will contact you next week if I haven't heard from you by then.

Regards,

[Your Name]

---

## PROJECT OVERVIEW

**{{businessName}}** would like to improve their existing website to focus on getting more free consultations which will result in more paying clients.

You recognize the importance of a conversion-centered website, and thus the reason for a professional redesign with this purpose in mind.

As per your analytics data, over 50% of your website visitors are viewing the website on their mobile device. Our goal will be to create a clear and simplified process to request a free consultation with less distractions.

You are currently running multiple marketing campaigns on various channels and the website will need to be tailored to the visitors from these channels using effective landing pages that are relevant to the visitor and achieves the necessary business goals.

Currently, 2% of website visitors result in free consultations and 10% of free consultations result in paying clients.

The goal would be to increase the number of free consultations to 4 or 5% which I believe is a low estimate based on the results I've seen in similar industries focused around effective call-to-actions (free consultations).

At an average value of $1,250 per client and based on double your existing monthly client sign ups (4 per month), I'm very confident we could achieve **4 additional sign ups per month** (4 x $1,250 = $5,000) or 48 additional sign ups per year (48 x $1,250 = $60,000).

Below is the contact email of John Smith. After working with him on a similar project, his business almost tripled in sales within one year. I mention this just to backup what I've stated above.

**John Smith**  
Director at XYZ  
johnsmith@xyz.com

---

## PROJECT OPTIONS

I've listed 3 possible options below for the project. You will notice that option 3 has a monthly retainer service included. This provides you with on-going access to my expertise in this area as well as the tasks outlined below.

Based on our previous conversations, I would estimate and recommend that you will benefit from my retainer services for a minimum of 3-6 months.

### Option 1:

I will redesign {{businessName}} website focused on acquiring more free consultations as the main priority.

Additional services under this option include:

- Integrating social media profiles
- Integrating your email marketing service provider
- Google Analytics integration

### Option 2:

This option includes everything from option 1, but also includes the following additional services:

- Submission to Google Search Console for SEO purposes
- 10 Premium Stock Photo Images
- Creation of 3 additional landing pages for various marketing campaigns

### Option 3:

This option includes everything from options 1 and 2, but also includes the following additional services:

- AdWords account setup, creating effective campaigns and monitoring for improvements
- Local directory submissions (this boosts your SEO results)
- Google local listing (this boosts your SEO results)
- Integrating and configuring additional CTA software tools like SumoMe
- Integrating live-chat software (Zopim)

---

## TERMS OF AGREEMENT

You will notice that I don't provide an hourly billing cost. This is harmful to you as it discourages efficiency and creativity from my part and in the end, we are both focused on the outcome and not inefficient hours worked.

The prices provided below are fixed, which means there are no hidden fees and I absorb all the risk in completing the project within these boundaries.

The pricing for each option is as follows:

**Option 1:** $4,000 once-off  
**Option 2:** $5,250 once-off  
**Option 3:** $6,500 once-off + $750/month retainer

Once-off fees are to be paid in full upfront and the retainer amounts are due at the beginning of each month.

---

## AGREEMENT

Please select the option you prefer with an "X" and sign below:

☐ Option 1  
☐ Option 2  
☐ Option 3

<table style="width:100%; border-collapse: collapse; margin-top: 20px;">
  <tr>
    <td style="border: 1px solid black; padding: 15px; width: 50%;">
      <strong>Client Information</strong><br><br>
      **Name:** {{fullName}}<br><br>
      **Signature:** _____________________<br><br>
      **Date Signed:** _____________________
    </td>
    <td style="border: 1px solid black; padding: 15px; width: 50%;">
      <strong>Service Provider</strong><br><br>
      **Name:** [Your Name]<br><br>
      **Signature:** _____________________<br><br>
      **Date Signed:** _____________________
    </td>
  </tr>
</table>

---

*Upon receipt of this agreement, I will send through a contract and an invoice for payment.*

**Note:** This proposal is only valid until [Expiration Date]
  
  
  
  
  
  
  
  
  
`,
  category: "proposal",
  isTemplate: true,
  variables: [
    "fullName",
    "firstName", 
    "businessName",
    "billingAddress",
    "currentDate",
    "serviceDesired"
  ]
},
{
  title: "Master Service Agreement Contract",
  description: "Comprehensive service agreement, courtesy of Traversy Media",
  content: `# CLIENT SERVICE AGREEMENT

## 1. IDENTIFICATION OF THE PARTIES

1. This Service Agreement (the 'Agreement') is made and entered into on {{currentDate}} by and between {{businessName}} with its registered address at {{billingAddress}} (the 'Client') and [Your Company Name] (the 'Service Provider').

2. The Client and the Service Provider are hereinafter referred to individually as a 'Party' and collectively as the 'Parties'.

3. By accepting this Agreement and subject to the terms and conditions herein, the Service Provider agrees to provide {{serviceDesired}} (the 'Services') to the Client in connection with its business operations.

## 2. ENGAGEMENT AND SERVICES

### 2.1 Project-Based Work

1. The Client hereby engages the Service Provider to provide and perform the following Services in connection with {{serviceDesired}}. These Services shall include the following:

   a. Website Development
   b. Marketing Strategy and Improvements
   c. AdWords Campaign Setup, On-page SEO Improvements, Social Media Ad Campaign Setup
   d. Weekly Progress Reports

### 2.2 Retainer-Based Work (Optional)

2. The Client hereby engages the Service Provider to provide and perform the following Services on an ongoing basis, in terms of a retainer arrangement **OR** to be billed on an hourly basis. These Services shall include the following:

   a. Website Development
   b. Marketing Strategy and Improvements
   c. AdWords Campaign Setup, Social Media Ad Campaign Setup
   d. Content Writing and SEO
   e. AB Split Testing and Optimization

3. All Services to be performed by the Service Provider shall be performed with promptness, in a diligent manner and at a level of proficiency to be expected from the Service Provider with the background and experience that the Service Provider has represented it has.

## 3. SERVICE PERIOD AND TERMINATION

1. This Agreement shall commence on {{currentDate}} and shall remain in effect until the completion of the Service or the earlier termination of this Agreement as provided in section 3.2 of the Agreement.

2. Either party may elect to terminate the Agreement by providing at least one months' notice (30 calendar days) to the other Party. Such notice must be in writing. Payment for the Services performed to date are not recoverable upon termination.

3. Either Party will be informed in writing of any change in the Service Agreement at least one month in advance of the termination of a service.

4. Upon the effective date of termination of this Agreement, all legal obligations, rights and duties arising out of this Agreement shall terminate except for such legal obligations, rights and duties as shall have accrued prior to the effective date of termination.

## 4. FEES FOR SERVICES PERFORMED

### 4.1 Payment Methods

1. Payment is to be made via [PayPal / Electronic Bank Transfer / etc.] within 3 working days on receipt of invoice to the following account details:

   [Insert your bank details or account information]

### 4.2 Project Based Work

1. The Client agrees to pay the Service Provider a project fee of {{estimatedBudget}}. The Service Provider's obligation to render the Services mentioned in Section 2 of this Agreement is conditional upon payment by the Client in the following terms:

   a. 100% upfront payment upon receipt of Invoice.

   *OR*

   b. 50% down payment upon receipt of Invoice (the 'Down Payment').
   c. The remaining 50% is to be paid upon completion of website **OR** on [specified date].

2. The completion of the project is described as:
   - Fully functional conversion-focused website
   - Optimizing each page for on-page SEO
   - Marketing campaigns for AdWords and Social Media

3. If during any time of the project duration the Client fails to make payment in terms of the Project Based Schedule, the Service Provider may cease provision of the Services until payment of the outstanding fee has been made.

### 4.3 Retainer Based Work

1. In consideration for Services rendered, the Client agrees to pay the Service Provider's fee of [Amount] which will be due up front on the first of each month for that month's Services until the Agreement has ended.

2. If such amount is not received by this date, the Service Provider reserves the right to cease provision of Services to the Client.

### 4.4 Advertising Fees

1. All advertising fees, such as Google Ads, Facebook Ads, and any other related advertising fees, are for the Client's account.

2. The Client is committed to spend a minimum of [Amount] for Google Ads and [Amount] for Facebook Ads each month, for the validity of this Agreement.

## 5. OBLIGATIONS OF THE CLIENT

1. The Service Provider will not commence work until the Client has provided all the necessary data, photography, tools and other necessary information that may be required by the Service Provider to effectively perform the Services rendered.

2. The Client agrees that the completion of one or more of the deliverables may depend on and require the Client's commitment of certain resources which should be promptly provided.

## 6. OWNERSHIP AND RISK

1. The Service Provider remains the owner of all equipment, software and records used or produced in the service of the Client, until the amount owed by the Client to the Service Provider has been paid in full.

2. After payment in full, the Client is the owner of all products, data and reports produced by the Service Provider.

3. The Service Provider is not responsible for anything falling outside the scope of services referred to in Section 2 of the Agreement unless such services have been agreed to in writing.

4. The Client hereby guarantees that the Service Provider shall not be held liable for the results or does not warranty any results flowing from the Services provided by the Service Provider.

## 7. CONFIDENTIALITY AND RESPONSIBILITY

1. In this Agreement, the Services performed and any and all information relating to the Client's business, including, but not limited to, research, developments, products plans, products, services, diagrams, formulae, processes, techniques, technology, software, ideas, discoveries, designs, inventions, improvements, copyrights, trademarks, marketing, sales, trade secrets, intellectual property, finances disclosed by the Client is hereinafter referred to as 'Confidential Information'.

2. Unless otherwise agreed to in advance and in writing by the Client, the Service Provider will not, except as required by law or court order, use the Confidential Information for any purpose whatsoever other than the performance of the Services or disclose the Confidential Information to any third party.

## 8. NO COMPETITION

1. During the term of this Agreement, the Service Provider will engage in no business or other activities which are directly competitive with the business activities of the Client's local geographic target audience in the Client's respective trading city/town without obtaining the prior written consent of the Client.

## 9. WARRANTIES

1. The Service Provider warrants and represents that it has full capacity and authority to enter into the Agreement and that the Services performed by the Service Provider will be rendered in accordance with sound professional practices.

2. The Client warrants and represents that it has full capacity and authority to enter into the Agreement and has the ability, including relevant permissions, licences and consents necessary to perform its obligations in terms of the Agreement.

## 10. INDEPENDENT CONTRACTORS

1. The Service Provider agrees that all Services will be performed by the Service Provider as an independent contractor and that this Agreement does not create an employer-employee relationship between the Service Provider and the Client.

## 11. LIMITATION OF LIABILITY

1. In no event shall the Service Provider be liable to the Client for any loss of profit, loss of business, loss of data, or for any indirect, incidental, consequential, special or exemplary damages arising in connection with the services provided to client.

2. The entire liability of the Service Provider to the Client in connection with the Services provided shall not exceed, in the aggregate, the total amount of fees paid or becoming due under this Agreement in the twelve (12) month period immediately preceding the event giving rise to such liability.

## 12. TRANSFER OF INTELLECTUAL PROPERTY RIGHTS

1. The Service Provider grants all IP rights to the Client upon final payment for the Services performed in exchange for a right to use the content developed for marketing and business development purposes.

## 13. ASSIGNMENT

1. The Services to be performed by the Service Provider herein are personal in nature, and the Client has engaged the Service Provider as a result of the Service Provider's expertise relating to such Services.

## 14. GOVERNING LAW AND DISPUTE RESOLUTION

1. This Agreement shall be construed in accordance with and be subject to the laws of [your state/country]. All court proceedings relating to or arising out of this Agreement shall be solved by the Courts of [your state/country].

2. The Parties agree to attempt to settle any dispute arising out of or relating to the Agreement amicably, before commencing any court proceedings.

## 15. RECOVERY OF LITIGATION EXPENSES

1. If any legal action, arbitration or other proceeding is necessary for the enforcement of this Agreement, the prevailing party or parties shall be entitled to recover reasonable attorneys' fees and other costs incurred.

## 16. GENERAL

1. This Agreement constitutes the entire agreement of the Parties on the subject hereof and supersedes all prior understandings and instruments on such subject.

2. This Agreement may not be modified other than by a written instrument executed by duly authorized representatives of the Parties.

## 17. SEVERABILITY

1. If any court of competent authority finds that any provision of this Agreement (or part of any provision) is invalid, illegal, or unenforceable, that provision or part provision shall, to the extent required, be deemed to be deleted, and the validity and enforceability of the other provisions of this Agreement shall not be affected.

## 18. SIGNATURES

The Parties duly execute this Agreement by their signatures below:

<table style="width:100%; border-collapse: collapse; margin-top: 20px;">
  <tr>
    <td style="border: 1px solid black; padding: 15px; width: 50%;">
      <strong>Client</strong><br><br>
      **Company:** {{businessName}}<br><br>
      **Name:** {{fullName}}<br><br>
      **Title:** _____________________<br><br>
      **Date:** _____________________<br><br>
      **Signature:** _____________________
    </td>
    <td style="border: 1px solid black; padding: 15px; width: 50%;">
      <strong>Service Provider</strong><br><br>
      **Company:** [Your Company Name]<br><br>
      **Name:** [Your Name]<br><br>
      **Title:** _____________________<br><br>
      **Date:** _____________________<br><br>
      **Signature:** _____________________
    </td>
  </tr>
</table>
  
  
  
  
  
  
  
  
  
`,
  category: "contract",
  isTemplate: true,
  variables: [
    "currentDate",
    "businessName",
    "billingAddress",
    "serviceDesired",
    "estimatedBudget",
    "fullName"
  ]
},
{
  title: "Professional Invoice",
  description: "Clean invoice template for billing, courtesy of Traversy Media",
  content: `# INVOICE

**[Your Company Name]**  
[Your Address]  
[City, State, ZIP]  
[Phone Number]

**Invoice #:** [Invoice Number]  
**Date:** {{currentDate}}

---

## BILL TO:

**{{businessName}}**  
{{fullName}}  
{{billingAddress}}

---

## SERVICES PROVIDED:

| **Description** | **Price** | **Amount** |
|-----------------|-----------|------------|
| {{serviceDesired}} | {{billedAmount}} | {{billedAmount}} |
| SEO Research + Implementation | [Amount] | [Amount] |
| Social Media Setup + Integrations | [Amount] | [Amount] |
| | | |
| | **Subtotal** | {{billedAmount}} |
| | **Total Due** | **{{remainingBalance}}** |

---

## PAYMENT SUMMARY:

**Total Amount:** {{billedAmount}}  
**Amount Paid:** {{paidAmount}}  
**Remaining Balance:** {{remainingBalance}}

---

## PAYMENT TERMS:

**Terms:** Payable on receipt

**Payment Methods:** [List accepted payment methods]

If you have any questions, please do not hesitate to contact me.

---

## BANK DETAILS:

**Account Name:** [Your Business Name]  
**Account Number:** [Account Number]  
**Routing Number:** [Routing Number]  
**Bank Name:** [Bank Name]

---

**Contact Information:**  
**Email:** [Your Email]  
**Phone:** [Your Phone]  
**Website:** [Your Website]

Thank you for your business!
  
  
  
  
  
  
  
  
  
`,
  category: "invoice",
  isTemplate: true,
  variables: [
    "currentDate",
    "businessName",
    "fullName",
    "billingAddress",
    "serviceDesired",
    "billedAmount",
    "paidAmount",
    "remainingBalance"
  ]
},
{
  title: "Monthly Client Report",
  description: "Marketing performance report template, courtesy of Traversy Media",
  content: `# Monthly Performance Report

**Date:** {{currentDate}}  
**Prepared by:** [Your Agency Name]

---

**To:** {{fullName}}  
**Company:** {{businessName}}

Hi {{firstName}},

It was a pleasure providing our marketing services for you.

Please see the results below for the month of [Month]:

---

## WEBSITE PERFORMANCE

### Bookings/Sales:
**Total Bookings:** [Number]  
**Previous Month:** [Number]  
**Month Before:** [Number]

### Google Maps Performance:
**Total Calls:** [Number]  
**Direction Requests:** [Number]

---

## SEO RANKING

### "{{serviceDesired}} [Your City]"
**Google Map:** [Position]  
**Google Search:** [Page], [Position]

### "[Secondary Keyword]"
**Google Search:** [Page], [Position]

---

## WEBSITE ANALYTICS

**Total Visitors:** [Number]  
**Average Duration on Website:** [Time] minutes  
**Bounce Rate:** [Percentage]%

### Device Breakdown:
**Mobile Phones:** [Percentage]%  
**Laptops/Computers:** [Percentage]%  
**Tablets:** [Percentage]%

---

## ADVERTISING PERFORMANCE

### AdWords Spend Overview:
**Total Spent:** [Amount]  
**Total Clicks:** [Number]  
**Cost Per Click:** [Amount]

### Demographics:
#### Gender:
**Male:** [Percentage]%  
**Female:** [Percentage]%

#### Age Groups:
**18-24:** [Percentage]%  
**25-34:** [Percentage]%  
**35-44:** [Percentage]%  
**45-54:** [Percentage]%  
**55-64:** [Percentage]%  
**65+:** [Percentage]%

---

## CONCLUSION

We achieved [highlight of the month] (great news!). We're optimistic for what lies ahead in the coming months as we continue to make improvements and optimizations.

It was a pleasure providing you with this report.

As always, please let me know if you have any questions, and I'll be glad to help.

---

**Regards,**

[Your Name]  
[Contact Number]  
[Your Website]
  
  
  
  
  
  
  
  
  
`,
  category: "other",
  isTemplate: true,
  variables: [
    "currentDate",
    "fullName",
    "firstName",
    "businessName",
    "serviceDesired"
  ]
}, 
{
 title: "Cold Outreach Email",
 description: "Professional cold outreach email for business development",
 content: `# Cold Outreach Email

**Subject:** Quick question about {{businessName}}'s website

Hi {{firstName}},

I came across {{businessName}} while researching [industry/location] businesses and was impressed by [specific compliment about their business/website].

I noticed a few opportunities that could help {{businessName}} [specific benefit - get more leads/increase sales/improve online presence]. 

I specialize in helping businesses like yours with {{serviceDesired}} and have helped similar companies:
- [Specific result #1]
- [Specific result #2] 
- [Specific result #3]

I'd love to show you a quick 15-minute example of what this could look like for {{businessName}}.

Would you be open to a brief call this week? I have availability on [day] at [time] or [day] at [time].

If not, no worries at all - I know you're busy running {{businessName}}.

Best regards,

[Your Name]  
[Your Title]  
[Your Phone]  
[Your Email]  
[Your Website]

P.S. Here's a link to a recent case study: [Link]
 
 
 
 
 
 
 
 
 
`,
 category: "other",
 isTemplate: true,
 variables: [
   "businessName",
   "firstName",
   "serviceDesired"
 ]
},
{
  "title": "Cold Calling Script",
  "description": "A comprehensive cold calling script for freelance web developers, adaptable for various organization types and goals beyond just sales.",
  "content": `# Boosting Your Web Presence: Cold Call Script\n\n**[BEFORE THE CALL: Research the organization/business - check their website, note specific issues, understand their goals. Try to find a direct contact name if possible, but if not, use the company name as a fallback.]**\n\n---\n\n## THE OPENING (First 10 seconds are critical)\n\n**Initial Contact:**\n\"Hi, I'm trying to reach the peron who handles the online presence or website for {{businessName}}?\"\n\n**Introduction & Permission:**\n\"Hi [{{firstName}} / 'there'], my name is [YOUR NAME] and I'm a web developer. The reason for my call is I work with [type of organization/business, e.g., local businesses, non-profits, consultants] to help them [choose one: enhance their online presence / improve website functionality / resolve website issues]. \n\n[Choose ONE of the following options based on your research]:\n* **If they have an existing website:** \"I took a quick look at {{businessName}}'s website, and it really looks like a great foundation! I'd love to chat briefly about some ideas to help you **make it even better** and get more out of your online presence. We specialize in helping organizations like yours enhance what they already have to better meet their goals.\"\n* **If they do NOT have an existing website:** \"I noticed {{businessName}} doesn't currently have a dedicated website, and that's perfectly fine! Many organizations are just starting to explore this. We specialize in helping businesses like yours **establish a strong and effective online presence** to [mention benefit, e.g., connect with more people / easily share important information / build trust and credibility / streamline operations]. We could help you get set up effectively right from the start.\"\n\nBefore we dive into any of that, I just have a few quick questions to see if this would even be relevant for you. I'll be super brief, under 30 seconds. Sound fair?\"\n\n**[If they say NO:]** \"No problem at all! Would there be a better time to connect, or is this something that's just not a priority right now?\"\n\n---\n\n## QUALIFICATION QUESTIONS (Keep it conversational)\n\n**1. Current Situation:**\n\"How long has {{businessName}} been established?\" \n[Listen for: established vs. new, their pride in longevity]\n\n**2. Website Effectiveness:**\n\"On a scale of 1-10, how happy are you with your current website's effectiveness in achieving its goals?\"\n[Follow up: \"What would make it a 10?\"]\n\n**3. Impact:**\n\"Does your website effectively serve its purpose, or does it mostly just exist online?\"\n[Listen for: pain points, missed opportunities]\n\n**4. Decision Making:**\n\"If you were to improve your web presence, would that be something you'd handle yourself, or would others need to be involved in the decision?\"\n[Identify: decision maker, process]\n\n**5. Timing & Investment:**\n\"Organizations like yours typically invest between **[User: Insert low-end budget]** and **[User: Insert high-end budget]** to address these kinds of issues. Is improving your web presence something you've considered for this period?\"\n\n---\n\n## VALUE PROPOSITION (Based on their answers)\n\n**[Choose the most relevant based on their pain points:]**\n\n### For \"Website isn't achieving goals\":\n\"Based on what you've told me, it sounds like your website might not be fully supporting your objectives. We specialize in transforming passive websites into effective tools. For example, we helped [similar organization/business] go from [old metric] to [new metric] with just a few strategic changes.\"\n\n### For \"Outdated/Slow Website\":\n\"I hear this a lot from successful organizations like yours. Your website was probably great when it was built, but web standards change fast. Modern web standards are important for user experience, and a slow site can be frustrating. The good news is this is completely fixable.\"\n\n### For \"We handle it internally\":\n\"That's great that you have someone working on it! Often what we find is internal teams are stretched thin. We typically work alongside existing resources, handling complex technical aspects while your team focuses on content and daily updates. It's like having a specialist on call.\"\n\n### For \"No budget right now\":\n\"I completely understand. Let me ask you this though - what do you think the cost is to your organization for not achieving its online potential? If your website is preventing even a few key interactions per month, that could be significant. Would it make sense to at least explore what the return on investment might look like?\"\n\n---\n\n## CLOSING FOR APPOINTMENT\n\n**Soft Close:**\n\"You know what [{{firstName}} / 'there'], based on everything you've shared, I think we could definitely help {{businessName}} [specific benefit based on their pain point]. \n\nWhat I'd like to suggest is this: why don't we schedule a brief **10-15 minute** screen share where I can show you exactly what I'm seeing with your website and what the opportunities are. There's no obligation, and even if we don't work together, you'll walk away with actionable insights you can use.\n\nI have some time available [give 2-3 general options, e.g., 'early next week,' 'later this week,' or 'morning/afternoon next day']. Which works better for you?\"\n\n**[If they need to think about it:]**\n\"I totally understand. Making changes to your web presence is an important decision. How about this: I'll send you a quick email with a few examples of organizations/businesses similar to yours that we've helped, along with the specific results they achieved. Then we can reconnect next week to see if it makes sense to explore further. What's the best email to reach you?\"\n\n---\n\n## OBJECTION HANDLING\n\n### \"We already have a website\" (or \"We don't need a website\")\n\"That's great! Most of our clients already have websites when they come to us. The question isn't whether you have a website, but whether it's working as hard as it should be for your organization. Quick question - when was the last time your website directly contributed to a key objective for you?\"\n\n### \"We're happy with our current developer\"\n\"That's wonderful – it's so important to have someone you trust. We actually work with organizations that have existing developers all the time. Often, we handle specialized projects like performance optimization or specific functionality improvements while your current developer maintains the day-to-day. Would you be open to exploring how we might complement what you're already doing?\"\n\n### \"This isn't a priority right now\"\n\"I appreciate your honesty. Can I ask – if improving your web presence isn't a priority, what is the main challenge {{businessName}} is focused on solving right now?\" [Listen, then tie their challenge back to how a better website could help]\n\n### \"Just send me some information\"\n\"I'd be happy to send you information, but I want to make sure it's relevant to {{businessName}}'s specific situation. Let me ask you two quick questions so I can send you the most helpful examples... [ask qualification questions]\"\n\n### \"We don't have the budget\"\n\"I hear you, and I respect that you're being careful with expenses. Let me flip the question though - if I could show you how a small investment in your website could significantly improve [mention a specific objective], would the budget question change? Many of our clients find that the website improvement pays for itself quickly through increased efficiency, engagement, or whatever their primary goal is.\"\n\n---\n\n## FOLLOW-UP COMMITMENT\n\n**If No Immediate Interest:**\n\"No problem at all, [{{firstName}} / 'there']. I know timing is everything. Would it be okay if I check back in with you in about [30/60/90] days to see if anything has changed? Sometimes opportunities come up unexpectedly.\"\n\n**Get Permission:**\n\"Great! I have your number here as {{phone}}. Is that still the best way to reach you? And what email should I use to send you those examples we discussed?\"\n\n**Plant a Seed:**\n\"In the meantime, [{{firstName}} / 'there'], here's something to keep in mind - every month your website isn't optimized is potentially limiting your organization's potential. When you're ready to explore turning your website into a more effective tool, I'll be here to help.\"\n\n---\n\n## POST-CALL ACTIONS\n\n**Immediately After Call:**\n- Log call outcome in the lead's DevLeads notes\n- Send promised materials within 2 hours\n- Schedule follow-up reminder\n- Note specific pain points mentioned\n\n**Follow-Up Email Template:**\nSubject: Boosting Your Web Presence - Opportunities for {{businessName}}\n\nHi [{{firstName}}],\n\nThanks for taking my call earlier. As promised, here are 3 examples of [type of organization/business] we've helped:\n\n[Example 1: Similar organization/business, specific results]\n[Example 2: Problem they solved, impact achieved]\n[Example 3: Before/after metrics]\n\nI noticed your website [specific issue discussed]. This is exactly what we fixed for [similar client].\n\nWould [specific day/time] work for a quick 10-15 minute screen share to show you what's possible?\n\nBest,\n[Your name]\n[Your phone]\n\n**Follow-Up Call (if no response):**\n\"Hi [{{firstName}} / 'there'], [YOUR NAME] here. I sent over those examples we discussed last week. I wanted to check if you had a chance to review them and see if any questions came up? I have some time this week if you'd like to explore what this might look like for {{businessName}}.\"\n\n---\n\n## TALKING INVESTMENT RANGES\n\n**When They Ask About Investment:**\n\"Great question! Every project is unique, but to give you a ballpark, our services typically range from **[User: Insert low-end basic project cost]** for basic updates to **[User: Insert high-end complex project cost]** for more complex functionality. Ongoing support is typically **[User: Insert monthly support range]** per month.\n\nThe real question is what kind of return you'll see on this investment. Most of our clients find that the website improvement pays for itself quickly through increased efficiency, engagement, or whatever their primary goal is. Should we look at what the potential return might be for {{businessName}}?\"\n\n---\n\n## REMEMBER:\n\n1.  **Energy matters** - Smile while you dial; they can hear it.\n2.  **Listen more than you talk** - Aim for a 70/30 rule.\n3.  **Focus on their organizational/business outcomes**, not your technical skills.\n4.  **Every \"no\" gets you closer to a \"yes\"** - It's a numbers game.\n5.  **Follow up religiously** - Most successes happen after the 5th contact.\n\n**Success Rate Benchmarks:**\n- Dial 50-100 organizations = 5-10 conversations\n- 5-10 conversations = 2-5 qualified prospects\n- 2-5 qualified prospects = 1-2 appointments\n- 1-2 appointments = 1 new client\n\nKeep dialing. Your next client is just a phone call away!
  
  
  
  
  
  
  
  
  
  
  `,
  "category": "other",
  "isTemplate": true,
  "variables": [
    "firstName",
    "businessName",
    "serviceDesired",
    "phone"
  ]
},
{
  title: "DevLeads Features Documentation",
  description: "Complete features guide with all screenshots and documentation for DevLeads application",
  content: `# DevLeads Features Documentation

Guide for features and functionality organized by application pages.

**→ <a href="https://github.com/DevManSam777/devleads/blob/main/README.md" target="_blank">README</a>** - Main project overview and introduction

**→ <a href="https://github.com/DevManSam777/devleads/blob/main/docs/SETUP-GUIDE.md" target="_blank">Setup Guide</a>** - Complete installation and configuration guide

## Table of Contents

1. Login Page
2. Dashboard Page
3. Hitlists Page
4. Forms Page
5. Resources Page
6. Settings Page
7. Web Forms Integration
8. Email Notifications
9. Tips & Tricks

---

## 1. Login Page

Secure Firebase-powered authentication with modern login interface.

![Login page light mode](https://github.com/DevManSam777/devleads/blob/main/dashboard/assets/devleads_features/login_light.png?raw=true)

![Login page dark mode](https://github.com/DevManSam777/devleads/blob/main/dashboard/assets/devleads_features/login_dark.png?raw=true)

### Key Features

#### Login Interface
- **Professional Design**: Clean card-based layout with DevLeads branding
- **Dark/Light Mode**: Automatic theme detection based on system preferences
- **Responsive Design**: Optimized for desktop and mobile devices
- **Visual Feedback**: Loading states, error animations, and user-friendly messages

#### Authentication
- **Firebase Integration**: Secure email/password authentication
- **Session Persistence**: Maintains login state during browser session
- **Password Recovery**: Email-based password reset functionality
- **Auto-redirect**: Automatic dashboard redirect when authenticated

#### Security Features
- **Rate Limiting**: Protection against brute force attacks
- **Input Validation**: Client and server-side validation
- **Error Handling**: Specific, helpful error messages for common issues

### Usage Guide

1. **Login Process**:
   - Navigate to \`/login\` (or root URL redirects automatically)
   - Enter email and password credentials
   - Click "Sign In" to authenticate
   - Successful login redirects to dashboard

2. **Password Recovery**:
   - Enter email address in login form
   - Click "Forgot password?" link
   - Check email for reset instructions
   - Follow link to create new password

3. **Error Handling**:
   - System displays specific error messages for different issues
   - Visual shake animation indicates failed login attempts
   - Rate limiting prevents excessive failed attempts

---

## 2. Dashboard Page

The main workspace where you manage leads, view analytics, and track your business performance.

### Analytics & Charts  

Interactive visualizations and key performance metrics with collapsible interface.

![Analytics light](https://github.com/DevManSam777/devleads/blob/main/dashboard/assets/devleads_features/analytics_light.png?raw=true)

![Analytics dark](https://github.com/DevManSam777/devleads/blob/main/dashboard/assets/devleads_features/analytics_dark.png?raw=true)

### Key Features

#### Dashboard Analytics
- **Lead Status Distribution**: Visual breakdown of lead statuses
- **Revenue Trends**: Monthly and yearly financial charts
- **Performance Metrics**: Key business indicators
- **Real-time Updates**: Live data visualization
- **Collapsible Sections**: Minimize/maximize chart sections for better screen space management

#### Chart Types
- **Pie Charts**: Status distribution and categorical data
- **Line Charts**: Revenue trends and time-based metrics
- **Bar Charts**: Comparative data and monthly summaries
- **Progress Indicators**: Goal tracking and completion rates

#### Key Metrics
- **Total Revenue**: All-time and monthly earnings
- **Active Leads**: Current pipeline status
- **Conversion Rates**: Lead-to-client conversion tracking
- **Average Project Value**: Financial performance indicators

### Available Charts

1. **Project Status Distribution**: Pie chart showing lead status breakdown
2. **New Leads vs. Closed (Won)**: Line chart comparing new leads to successfully completed projects
3. **Revenue Comparison by Month**: Bar chart showing monthly revenue trends

### Usage Guide

1. **Viewing Analytics**:
   - Dashboard displays key metrics automatically
   - Charts update in real-time as data changes
   - Interactive elements provide detailed information
   - Charts are responsive for mobile viewing
   - Click section headers to collapse/expand analytics sections

2. **Understanding Metrics**:
   - Status distribution shows pipeline health
   - Revenue trends indicate business growth
   - Conversion rates measure sales effectiveness
   - Project values help with pricing strategies

### Dashboard Views

Toggle between list and grid layouts for lead management.

### Key Features

- **List View**: Traditional table format with sortable columns
- **Grid View**: Card-based layout for visual lead overview
- **View Toggle**: Switch between layouts with single click
- **Responsive Design**: Both views adapt to screen size

### Usage Guide

- **Switch Views**: Click the list/grid toggle button in the dashboard toolbar
- **List View**: Best for detailed data comparison and sorting
- **Grid View**: Best for visual scanning and quick status overview

![Grid view light](https://github.com/DevManSam777/devleads/blob/main/dashboard/assets/devleads_features/dash_grid_light.png?raw=true)

![Grid view dark](https://github.com/DevManSam777/devleads/blob/main/dashboard/assets/devleads_features/dash_grid_dark.png?raw=true)

![List view light](https://github.com/DevManSam777/devleads/blob/main/dashboard/assets/devleads_features/dash_list_light.png?raw=true)

![List view dark](https://github.com/DevManSam777/devleads/blob/main/dashboard/assets/devleads_features/dash_list_dark.png?raw=true)

### Lead Management

The core feature for managing potential and existing clients throughout their lifecycle.

#### Key Features

#### Lead Creation

- **Manual Entry**: Add leads directly through the dashboard
- **Web Form Submissions**: Automatic lead creation from embedded forms
- **Convert from Hitlists**: Convert individual prospects from hitlists to leads

#### Lead Information
- **Personal Details**: Name, contact information, preferred contact method
- **Business Information**: Company name, business contact details
- **Project Details**: Service desired, budget, timeline, project description
- **Billing Address**: Complete address information for invoicing
- **Custom Fields**: Extensible data structure for additional information

#### Lead Status Management
- **Status Tracking**: New, Contacted, In Progress, Closed (Won), Closed (Lost)
- **Status Filtering**: Filter leads by current status
- **Status History**: Track status changes over time

#### Advanced Features
- **Search**: Text search across lead information
- **Status Filtering**: Filter leads by status (All, New, Contacted, In Progress, Closed Won, Closed Lost)
- **Sorting Options**: Sort by creation date, last contacted date, name, business name, or status (with ascending/descending options)
- **Pagination**: Configurable page sizes with "Show All" option
- **Export Capabilities**: 
  - **Bulk Export**: Export all leads as JSON or CSV from dashboard
  - **Individual Export**: Export single leads from lead detail view
  - **Complete Data**: Includes payments and all associated information

### Usage Guide

1. **Adding a Lead**:
   - Navigate to Dashboard
   - Click "Add New Lead"
   - Fill in required fields (name, email, service desired)
   - Add optional information (business details, address, etc.)
   - Save to create the lead

   * _**Leads from form submissions will automatically be populated in the dashboard**_


2. **Managing Leads**:
   - View all leads in the main dashboard table
   - Click on any lead to view/edit details
   - Use status tabs (desktop)/dropdown (mobile) to update lead progression
   - Use search bar to find specific leads
   - Apply filters to narrow down the list

3. **Export Leads**:
   - **Bulk Export**: Click "Export All" button on dashboard for all leads
   - **Individual Export**: Click "Export Lead" button in lead detail view
   - **Format Options**: Choose JSON or CSV format in export modal
   - **Complete Data**: Exports include payments and all associated information

4. **Lead Lifecycle**:
   - **New**: Just submitted or created
   - **Contacted**: Initial contact made
   - **In Progress**: Work has begun
   - **Closed (Won)**: Project completed successfully
   - **Closed (Lost)**: Lead did not convert

### Lead Information Window

When you click on any lead from the dashboard, a detailed information window opens showing all the lead's information organized in easy-to-navigate tabs.

#### Viewing vs Editing Modes

**View Mode (Default)**:
- **Read Information**: See all lead details in a clean, organized layout
- **Quick Actions**: Edit, Export, and Delete buttons at the top
- **Tab Navigation**: Click tabs to view different sections
- **One-Click Access**: Quick access to common actions

**Edit Mode**:
- **Update Information**: All fields become editable with helpful guidance
- **Save Changes**: Save button appears to keep your changes
- **Smart Validation**: System checks your entries and provides helpful tips
- **Auto-formatting**: Phone numbers, money amounts, and dates format automatically

#### Information Tabs

![Tabs](../dashboard/assets/devleads_features/dash_tabs.png)

The lead information is organized into 7 sections for easy management:

### 1. Personal Information
**Contact details for the individual:**
- **Required Info**: First name, last name, email, phone number
- **Optional Info**: Phone extension, text messaging number
- **Smart Checking**: Email format validation, phone number formatting
- **Creation Date**: Shows when you first added this lead
- **Phone Formatting**: Automatically formats as (555) 123-4567

![Lead information](../dashboard/assets/devleads_features/dash_lead_info.png)

### 2. Business Information
**Company and work-related details:**
- **Company Info**: Business name, business phone with extension
- **Business Contact**: Business email address
- **Services**: What services the business provides
- **Smart Fields**: Some fields appear based on your selections
- **Flexible**: Business email is optional

![alt text](../dashboard/assets/devleads_features/dash_business.png)

### 3. Address Information
**Complete billing and mailing address:**
- **Full Address**: Street, apartment/unit, city, state, ZIP code, country
- **Map Integration**: "View on Google Maps" button when address is complete
- **Address Helper**: Ensures you have complete address information
- **Billing Ready**: Used for creating invoices and processing payments

![Business tab](../dashboard/assets/devleads_features/dash_address.png)

### 4. Service & Status
**Project details and current status:**
- **Service Type**: What service they want (Web Development, App Development)
- **Website Info**: Do they have a website? If yes, what's the address?
- **Contact Preference**: How they prefer to be contacted
- **Current Status**: Where this lead stands in your process
- **Last Contact**: When you last spoke with them
- **Visual Status**: Color-coded status indicators for quick reference

![Services tab](../dashboard/assets/devleads_features/dash_services.png)

### 5. Payments & Budget
**Money tracking and payment management:**
- **Budget Planning**: Their estimated budget and what you've billed
- **Payment Summary**: 
  - Total amount billed
  - Amount they've paid (calculated automatically)
  - Remaining balance (calculated automatically)
- **Payment History**: List of all payments with details
- **Payment Actions**: Add, edit, and delete payments (when editing)
- **Payment Details**: Each payment shows amount, date, and any notes
- **Auto-calculation**: Balance updates automatically when you add payments

![Payments tab](../dashboard/assets/devleads_features/dash_payments.png)

### 6. Forms & Documents
**Generated documents and file management:**
- **Created Forms**: List of contracts, proposals, and invoices you've made
- **Document Actions**: View, edit, and delete forms (when editing)
- **Create New**: "Create Form" button to make new documents
- **Document Info**: When created, last changed, and document type
- **Template Magic**: Generate professional documents using their information
- **File Upload**: Upload signed contracts and other important documents
- **File Organization**: Keep all their documents in one place

![Forms Tab](../dashboard/assets/devleads_features/dash_forms.png)

### 7. Notes & Messages
**Communication tracking:**
- **Customer Message**: Their original inquiry or message
- **Your Notes**: Private notes for your team
- **Expanding Text**: Text areas grow as you type more
- **Detailed Records**: Keep comprehensive communication history

![Notes tab](../dashboard/assets/devleads_features/dash_notes.png)

#### Smart Features

#### Easy Navigation
- **Desktop**: Tab bar with icons and clear labels
- **Mobile**: Dropdown menu showing current section
- **Keyboard Friendly**: Use keyboard to navigate between tabs

#### Input Validation
- **Real-time Help**: Immediate feedback as you type
- **Required Fields**: Clear indicators for what's required
- **Format Checking**: Validates formatting of email, phone numbers, websites, and money amounts
- **Helpful Messages**: Clear guidance on how to fix any issues

#### Auto-formatting Magic
- **Phone Numbers**: Automatically formats to (555) 123-4567
- **Money Amounts**: Properly formats dollar amounts
- **Dates**: Shows dates in your preferred format
- **Website URLs**: Automatically appends URLs when needed
- **Text Areas**: Dynamically expand to fit your content

#### Connected Features
- **Payment Integration**: Directly connected to your payment tracking
- **Document Creation**: Generate professional documents using lead/client information with built-in markdown editor
- **File Management**: Upload and organize PDF documents
- **Google Maps**: Click to view their address on Google Maps
- **Export Options**: Export individual lead information (bulk data can be exported from dashboard)

#### Detailed Usage Instructions

**Viewing Lead Information**:
- Click any lead card or table row from your dashboard
- Information window opens showing all their details
- Click the different tabs to see various information sections
- Use the action buttons at the top for Edit, Export, or Delete

**Updating Lead Information**:
- Open the lead information window and click "Edit"
- All tabs become editable with helpful form controls
- Make changes across any tabs you need
- Click "Save Changes" to keep all your updates
- Window automatically returns to view mode after saving

**Managing Payments**:
- Click the "Payments & Budget" tab
- See payment history and current balance
- When editing, use "Add Payment" to record new payments
- Add notes for individual payments
- Edit or delete existing payments using the action buttons
- Balance automatically updates based on your payments

**Working with Documents**:
- Go to "Forms & Documents" tab to see generated documents
- Click "Create Form" to make new contracts, proposals, or invoices
- View, edit, or delete existing documents
- Upload signed contracts and other important PDF files
- All documents are organized by lead

**Managing Contact Information**:
- Fill out complete address in "Address Information" tab
- Google Maps button appears when you have a complete address
- Set how they prefer to be contacted in "Service & Status" tab
- Set current lead status
- Track when you last contacted them for follow-up planning 

### Payment Tracking

Simple payment tracking system integrated directly into each lead's information.

#### Payment Features
- **Payment Records**: Track individual payments with amount, date, and notes
- **Automatic Calculations**: System automatically calculates total paid and remaining balance
- **Payment History**: View all payments for each lead in chronological order
- **Edit/Delete**: Modify or remove payments as needed (in edit mode)

#### Payment Information
Each payment record includes:
- **Amount**: Dollar amount of the payment
- **Payment Date**: When the payment was received
- **Notes**: Optional notes about the payment (purpose, method, etc.)

#### How It Works
- **Estimated Budget**: Set the client's estimated budget
- **Billed Amount**: Set the total amount you're billing for the project
- **Paid Amount**: Automatically calculated from all payment records (read-only)
- **Remaining Balance**: Automatically calculated (Billed Amount - Paid Amount) (read-only)
- **Payment List**: Shows all payments sorted by date

#### Adding Payments

**To Add a Payment**:
- Open any lead information window
- Go to "Payments" tab
- Click "Edit" mode
- Click "Add Payment" button
- Enter payment amount
- Select payment date 
- Add optional notes
- Click "Save Payment"

**Payment Management**:
- View all payments in the Payments tab
- In edit mode, use edit/delete buttons on each payment
- System automatically updates Paid Amount and Remaining Balance when payments change
- Balance calculations update in real-time

### Document Management

Generate professional documents with built-in markdown editor using lead data and upload/manage all files associated with leads and projects.

#### Form Generation Features
- **Template-Based Generation**: Create contracts, proposals, and invoices using pre-built templates
- **Lead Data Integration**: Automatically populate documents with lead information (name, address, project details, etc.)
- **Real-Time Preview**: See how documents will look with actual lead data
- **Multiple Formats**: Export as PDF or download as Markdown
- **Professional Output**: Print-ready, properly formatted documents

#### File Management Features
- **PDF Upload**: Upload signed documents and other files directly to leads
- **File Organization**: Organize documents by lead/project
- **File Metadata**: Track upload dates, file sizes, types
- **Secure Storage**: Protected document access

#### Document Types
- **Contracts**: Service agreements and legal documents
- **Proposals**: Project proposals and quotes
- **Invoices**: Billing documents and receipts
- **Specifications**: Project requirements and designs
- **Correspondence**: Email attachments and communications
- **Signed Documents**: E-signed contracts and agreements

#### E-Signature Workflow Tip
- **Generate Documents**: Create contracts/proposals using Form Builder
- **Get E-Signatures**: Consider using <a href="https://www.opensignlabs.com/" target="_blank">OpenSign</a> (available in Resources as well) for free document signing
- **Upload Signed Docs**: Upload completed signed PDFs (e.g. contracts) back to the client's profile
- **Track Progress**: Monitor document status throughout the signing process

#### Access Control
- **Lead Association**: Documents linked to specific leads
- **Secure Access**: Authentication required for document access

### Document Management Guide

**Generating Documents from Templates**:
- Navigate to a specific lead information window
- Go to "Forms & Documents" tab
- Click "Create Form" button
- Select a template (contract, proposal, invoice, etc.)
- System automatically populates template with lead data
- Preview the generated document
- Edit and customize from built-in editor
- Export as PDF for client or download as Markdown

**Uploading Documents**:
- Navigate to a specific lead information window
- Go to "Forms & Documents" tab
- Click "Upload Document" or drag & drop files
- Select PDF file from computer
- Add document description
- Save document

**Managing Documents**:
- View all documents in lead profile
- Download documents for external use
- Delete outdated or unnecessary documents
- Organize documents by type or date

**Document Access**:
- Documents are accessible only to authenticated users
- Files are served securely through the application from MongoDB database
- Document URLs are protected

---

## 4. Form Templates Page

Create and manage custom form templates for contracts, proposals, invoices, and other documents.

![Form templates page](../dashboard/assets/devleads_features/form_template_page.png)

### Key Features

#### Template Management
- **Pre-built Templates**: Starter templates for common document types
- **Completely Customizable**: Customize any way you like
- **Custom Templates**: Create your own templates from scratch
- **Template Library**: Organize templates by category
- **Draft System**: Save work-in-progress forms as drafts before finalizing
- **Template vs Draft Filtering**: Separate views for production templates and draft content

#### Form Building
- **Markdown Support**: Rich formatting with Markdown syntax
- **Variable Substitution**: Dynamic content using lead data
- **Preview Mode**: See how forms will look with actual data
- **Template Cloning**: Duplicate existing templates as starting points

![Form editing](../dashboard/assets/devleads_features/form_edit.png)

#### Document Generation
- **Lead Data Integration**: Automatically populate forms with lead information
- **PDF Export**: Generate PDF documents from templates
- **Markdown Export**: Download templates in Markdown format
- **Print-Ready Output**: Properly formatted for printing

![Form print](../dashboard/assets/devleads_features/form_print.png)

### Available Templates

1. **Service Contract**: Professional service agreements
2. **Web Development Proposal**: Detailed project proposals
3. **Invoice Template**: Billing and payment documentation
4. **Project Requirements**: Detailed project specifications
5. **Statement of Work**: Scope and deliverables documentation

### Template Structure

Each template object requires these properties:

\`\`\`javascript
{
  title: "Template Name",
  description: "Brief description",
  content: \`Markdown content with {{variables}}\`,
  category: "contract|proposal|invoice|agreement|other",
  isTemplate: true,
  variables: ["array", "of", "variables"]
}
\`\`\`

### Available Variables

Based on the templates in the file, these variables are available:

![Available variables](../dashboard/assets/devleads_features/form_variables.png)

#### Personal Information
- \`firstName\` - Client's first name
- \`lastName\` - Client's last name
- \`fullName\` - Client's full name
- \`email\` - Client's email address
- \`phone\` - Client's phone number

#### Business Information
- \`businessName\` - Business/company name
- \`businessEmail\` - Business email address
- \`businessPhone\` - Business phone number
- \`billingAddress\` - Complete billing address

#### Communication
- \`preferredContact\` - Preferred contact method

#### Project Information
- \`serviceDesired\` - Requested service description
- \`estimatedBudget\` - Client's estimated budget

#### Financial Information
- \`billedAmount\` - Amount billed to client
- \`paidAmount\` - Amount client has paid
- \`remainingBalance\` - Outstanding balance

#### Dates
- \`currentDate\` - Current date when form is generated
- \`createdAt\` - Date the client record was created

### Categories

Templates are organized into five categories:

- **contract** - Legal agreements and contracts
- **proposal** - Project proposals and quotes
- **invoice** - Billing and payment documents
- **agreement** - Service agreements and terms
- **other** - Reference materials, guides, and miscellaneous forms

### Draft vs Template System

DevLeads includes a powerful draft system to help you work on forms before making them available for production use.

#### Understanding Drafts vs Templates

**Templates**:
- **Production-ready** forms available for lead generation
- **Finalized content** tested and approved for client use
- **Searchable** in main template library
- **Used for document generation** with lead data

**Drafts**:
- **Work-in-progress** forms still being developed
- **Experimental content** or incomplete forms
- **Personal workspace** for form development
- **Not used for lead generation** until converted to templates

#### Draft Workflow

1. **Start with Draft**: Create new forms as drafts while developing content
2. **Iterate and Refine**: Edit and improve draft content without affecting production
3. **Test Content**: Preview drafts with sample data to ensure formatting works
4. **Convert to Template**: Change "Save as" setting from "Draft" to "Template" when ready

#### Filtering System

Use the dropdown filter to switch between views:
- **Templates**: Shows only production-ready templates (default view)
- **Drafts**: Shows only work-in-progress drafts

This separation keeps your workspace organized and prevents accidental use of incomplete forms.

### Usage Guide

![Create new form](../dashboard/assets/devleads_features/create_form.png)

1. **Creating a Template**:
   - Navigate to Forms page
   - Click "Create Form"
   - Enter form name and category
   - Choose "Template" from "Save as" dropdown
   - Write content using Markdown
   - Use variables like \`{{firstName}}\` for dynamic content
   - Save and test with sample data

2. **Working with Drafts**:
   - Navigate to Forms page
   - Click "Create Form"
   - Enter form name and category
   - Choose "Draft" from "Save as" dropdown
   - Develop content without pressure for perfection
   - Switch filter to "Drafts" to view all drafts
   - Convert to template when ready for production use

3. **Using Templates**:
   - Select a lead from the dashboard
   - Choose "Generate Form" from lead actions
   - Select the appropriate template (only templates appear, not drafts)
   - Review generated content
   - Export as PDF or download Markdown

4. **Template Variables**:
   Available variables include:
   - \`{{firstName}}\`, \`{{lastName}}\`, \`{{businessName}}\`
   - \`{{email}}\`, \`{{phone}}\`, \`{{businessEmail}}\`
   - \`{{serviceDesired}}\`, \`{{message}}\`
   - \`{{billingAddress.street}}\`, \`{{billingAddress.city}}\`
   - And more...

### Variable Usage

#### Basic Usage
<small>**_There is also a guide in "Other" category, as well as well as a link to to a reference guide on the "Resources" page_**</small>

Wrap variable names in double curly braces:

\`\`\`markdown
Dear {{fullName}},

Thank you for choosing {{businessName}} for {{serviceDesired}}.
\`\`\`

#### In Tables
\`\`\`markdown
| Service | Amount |
|---------|--------|
| {{serviceDesired}} | {{billedAmount}} |
| Amount Paid | {{paidAmount}} |
| Balance Due | {{remainingBalance}} |
\`\`\`

#### Important Rules
- Use double curly braces: \`{{variableName}}\`
- Variable names are case-sensitive
- List all variables in the \`variables\` array
- Check spelling carefully

### Running the Seeds

The project includes npm scripts to populate your database with the form templates:

**From server directory from command line:** 
#### \`npm run seed:force\`
 
  - Forces the form seeding process to run, deleting all existing templates and populating the forms page with fresh starter templates from the \`formSeeds.js\` file.

**Use this when:**
- You want to completely reset all templates
- You've made changes to existing templates and want to replace them

**Warning:** This will delete all existing form templates in your database.

#### \`npm run seed:reset\`
Inserts any starter template forms that are currently missing in the database (based on title), leaving existing forms untouched. Also resets the internal seeder status flag.

**Use this when:**
- You've added new templates to \`formSeeds.js\` and want to add them without affecting existing ones
- You want to restore any accidentally deleted default templates
- You need to reset the seeder status flag

**Safe option:** This preserves your existing custom templates.

![Form seeding](../dashboard/assets/devleads_features/npm_run_seed.png)

---


## 3. Hitlists Page

Organize and manage prospect businesses for outreach campaigns.

![Business hitlist page](../dashboard/assets/devleads_features/hitlist_page.png)

### Key Features

#### Hitlist Management
- **Multiple Lists**: Create separate lists for different campaigns
- **Business Profiles**: Detailed business information storage
- **Contact Tracking**: Multiple contacts per business
- **Campaign Organization**: Group prospects by type
- **Convert to Lead**: Escalate business from hitlist to main dashboard project with the click of a button

![Open hitlist](../dashboard/assets/devleads_features/open_hitlist.png)

#### Business Data
- **Company Information**: Business name, type of business, complete address
- **Contact Details**: First name, last name, business phone with extension, business email
- **Website Information**: Website URL (automatically formatted)
- **Status Tracking**: Not Contacted, Contacted, Follow-up Required, Not Interested, Converted
- **Priority Levels**: High, Medium, Low priority settings
- **Last Contacted Date**: Track when you last reached out
- **Notes**: Detailed notes for each business

![Individual hitlist business view](../dashboard/assets/devleads_features/hitlist_individual_business.png)

#### Integration Options
- **Business Finder**: Native automated business data collection from YellowPages.com
- **Import/Export**: 
  - **Import Data**: Import businesses from JSON or CSV files with duplicate checking
  - **Export Hitlist**: Export businesses as JSON or CSV formats
  - **Manual Import**: Add businesses individually with detailed information
- **Lead Generation**: Convert hitlist entries to active leads with full data transfer

### Usage Guide

1. **Creating Hitlists**:
   - Navigate to Hitlists page
   - Click "Create New Hitlist"
   - Enter hitlist name and description
   - Set campaign parameters
   - Begin adding businesses

2. **Adding Businesses**:
   - Open a hitlist and click "Add Business"
   - Enter business name and type of business
   - Add contact person's first and last name
   - Enter business phone (with optional extension) and email
   - Add website URL (optional)
   - Fill in complete business address
   - Set status (Not Contacted, Contacted, Follow-up Required, Not Interested, Converted)
   - Set priority level (High, Medium, Low)
   - Add last contacted date if applicable
   - Include any relevant notes
   - Save business profile

3. **Import/Export Data**:
   - **Import**: Click "Import Data" button, select JSON/CSV file with business data
   - **Export**: Click "Export Hitlist" button, choose JSON or CSV format
   - **Formats**: Supports standardized business data formats
   - **Validation**: Automatic duplicate checking during import

4. **Business Management**:
   - **Search Businesses**: Search within hitlists by business name or other details
   - **Filter by Status**: Filter businesses by their current status
   - **View Business Details**: Click any business to see complete information
   - **Edit Business Info**: Update business details, status, and notes
   - **Convert to Lead**: Convert interested prospects to leads with full data transfer
   - **Track Outreach**: Update status based on contact attempts and responses

### Business Finder

The Business Finder is built directly into DevLeads. It finds businesses from YellowPages.com, in real time, and adds them directly to your hitlists.

![Business Finder](../dashboard/assets/devleads_features/business_finder1.png)

### Key Features
- **Native Integration**: No external tools needed
- **Direct to Hitlists**: Businesses are added automatically
- **US Businesses Only**: Searches YellowPages.com
- **Auto-deduplication**: Skips businesses already in your hitlist

### How to Use

#### Step 1: Access Business Finder
1. Go to **Hitlists** page in DevLeads
2. Click **"Find Businesses"** button (no need to select a hitlist first)
3. Business Finder modal opens - ready to search

#### Step 2: Configure Search
1. **Business Type**: Enter what you're looking for
   - Examples: "restaurants", "coffee shops", "dentists"
2. **Location**: Enter city/state or ZIP code
   - Examples: "New York, NY" or "10036"
3. **Max Results**: Use slider (5-1000 businesses, default 30)
4. **Select Hitlist**: Choose which hitlist to add businesses to, or create a new one

#### Step 3: Start Search
1. Click **"Start Search"**
2. Watch progress bar
3. Businesses appear in your hitlist as they're found
4. Wait for completion (usually 2-10 minutes)

![alt text](../dashboard/assets/devleads_features/business_finder2.png)

![alt text](../dashboard/assets/devleads_features/business_finder3.png)

### After the Search

![alt text](../dashboard/assets/devleads_features/business_finder4.png)

#### What You Get
Each business includes:
- Company name
- Phone number  
- Address
- Website (when available)
- Rating

#### Next Steps
1. **Review Results**: Check the businesses added to your hitlist
2. **Clean Up**: Remove any irrelevant businesses
3. **Convert to Leads**: Click "Convert to Lead" for good prospects
4. **Start Outreach**: Use the contact information to reach out

![alt text](../dashboard/assets/devleads_features/business_finder5.png)

### Tips for Better Results

- **Be Specific**: "web design" works better than "technology"
- **Use City, State**: "Denver, CO" works better than just "Colorado"
- **Start Small**: Try 50 businesses first to test results
- **Major Cities**: Get better results in populated areas

### Troubleshooting

#### Search Won't Start
- Fill in all required fields
- Check location format (City, State or ZIP)
- Refresh page and try again

#### No Results Found  
- Try broader business terms
- Check location spelling
- Try a bigger city
- Use ZIP code instead of city name

#### Search Takes Forever
- Reduce max results number
- Check internet connection
- Try during off-peak hours

### Requirements

- DevLeads deployed with Docker (includes Chrome support)
- At least one hitlist created
- Stable internet connection

That's it! The Business Finder is designed to be simple - find businesses and add them to your hitlists automatically.

---


## 7. Web Forms Integration

Choose between two web components to collect inquiries on your website and automatically create leads in DevLeads.

### Choose Your Web Form

#### Quick Decision Guide

**Need a simple contact form?** → Use **Minimalist Contact Form**  
**Need detailed business inquiries?** → Use **Full Web Inquiry Form**

### Option 1: Minimalist Contact Form

![Min form](../dashboard/assets/contact_forms/minimal_form/min_form.png)

**Best for:** Simple contact pages, basic lead capture, quick inquiries

#### Features
- **Lightweight**: Minimal code footprint
- **Essential Fields**: Name, email, phone, message
- **Auto-formatting**: Phone number formatting
- **Theme Detection**: Automatic dark/light mode
- **Real-time Validation**: Immediate feedback
- **Customizable**: Customizable styling for light and dark themes
- **Professional Design**: Clean, modern appearance
- **Toast Notifications**:  Built in toast notifications for successful and unsuccessful form submissions

#### Form Fields
- First Name (required)
- Last Name (required) 
- Email (required, validated)
- Phone (optional, auto-formatted)
- Message (required)

#### Setup Instructions
See [Setup Guide - Web Forms Integration](./SETUP-GUIDE.md#web-forms-integration-optional) for implementation details.

#### Repository
**Source**: https://github.com/DevManSam777/minimalist-contact-form

### Option 2: Full Web Inquiry Form

![Full form](../dashboard/assets/contact_forms/full_form/form1.png)

![Full form](../dashboard/assets/contact_forms/full_form/form2.png)

![Full form](../dashboard/assets/contact_forms/full_form/form3.png)

![Full form](../dashboard/assets/contact_forms/full_form/form4.png)

![Full form](../dashboard/assets/contact_forms/full_form/form5.png)

**Best for:** Business websites, detailed project inquiries, comprehensive lead data

#### Features
- **Multi-step Process**: Guided form completion with review step
- **Comprehensive Fields**: Business details, billing address, project requirements
- **Conditional Logic**: Show/hide fields based on selections
- **Advanced Validation**: Complex form validation
- **Theme Support**: Light/dark mode
- **Customizable**: Customizable styling 
- **Professional Layout**: Business-focused design
- **Toast Notifications**:  Built in toast notifications for successful and unsuccessful form submissions

#### Form Fields
- **Personal**: First name, last name, email, phone, extension
- **Business**: Company name, business phone, business email
- **Project**: Service type, budget, timeline, requirements
- **Billing**: Complete address information
- **Preferences**: Contact method, communication preferences

#### Setup Instructions
See [Setup Guide - Web Forms Integration](./SETUP-GUIDE.md#web-forms-integration-optional) for implementation details.

#### Repository  
**Source**: https://github.com/DevManSam777/web_inquiry_form

### Integration with DevLeads

#### API Endpoint Configuration

Both forms submit to your DevLeads API endpoint:
\`\`\`
https://your-devleads-domain.com/api/leads
\`\`\`

#### Automatic Lead Creation

When someone submits either form:
1. **Lead Created**: Automatically added to your DevLeads dashboard
2. **Email Notifications**: Admin and customer emails sent (if configured)
3. **Data Populated**: All form fields mapped to lead record
4. **Status Set**: Lead starts with "New" status for follow-up

#### Required DevLeads Setup

Before using web forms, ensure:
- [ ] DevLeads is deployed and accessible
- [ ] API endpoint is working (\`/api/leads\`)
- [ ] CORS is configured for your website domain
- [ ] Email notifications configured (optional but recommended)

### Comparison Chart

| Feature | Minimalist Form | Full Inquiry Form |
|---------|----------------|-------------------|
| **Setup Time** | 2 minutes | 5 minutes |
| **Fields** | 5 essential | 15+ comprehensive |
| **Use Case** | Contact/Support | Project Inquiries |
| **File Size** | Smaller | Larger |
| **Customization** | Basic | Extensive |
| **Business Data** | No | Yes |
| **Multi-step** | No | Yes |
| **Billing Address** | No | Yes |

### Implementation Guide

#### Step 1: Choose Your Form

**Decision Factors:**
- **Website Type**: Personal blog vs business website
- **Lead Quality**: Basic contact vs detailed project info
- **User Experience**: Simple vs comprehensive
- **Data Needs**: Essential vs detailed business information

#### Step 2: Deploy DevLeads

Ensure your DevLeads application is:
- Deployed and accessible online
- API endpoint responding at \`/api/leads\`
- CORS configured for your website domain

#### Step 3: Add Form to Website

**For Minimalist Form:**
\`\`\`html
<!DOCTYPE html>
<html>
<head>
    <title>Contact Us</title>
</head>
<body>
    <h1>Get In Touch</h1>
    <contact-form endpoint="https://your-devleads-api.com/api/leads"></contact-form>
    
    <script src="https://raw.githack.com/DevManSam777/minimalist-contact-form/main/contact-form.js" defer></script>
</body>
</html>
\`\`\`

**For Full Inquiry Form:**
\`\`\`html
<!DOCTYPE html>
<html>
<head>
    <title>Project Inquiry</title>
</head>
<body>
    <h1>Start Your Project</h1>
    <web-inquiry-form api-url="https://your-devleads-api.com/api/leads"></web-inquiry-form>
    
    <script src="https://raw.githack.com/DevManSam777/web_inquiry_form/main/web-inquiry-form.js" defer></script>
</body>
</html>
\`\`\`

#### Step 4: Test Integration

1. **Submit Test Form**: Fill out and submit the form
2. **Check DevLeads**: Verify lead appears in dashboard
3. **Test Emails**: Confirm notifications are sent
4. **Verify Data**: Ensure all fields are properly mapped

#### Step 5: Customize (Optional)

**Styling Options:**
- Primary colors to match your brand
- Font selection
- Light/dark theme preferences
- Custom messaging

### Advanced Configuration

#### CORS Setup

Update your DevLeads \`server/server.js\`:

\`\`\`javascript
const allowedOrigins = [
  "https://www.yourdomain.com",
  "https://yourdomain.com",
  "http://localhost:3000", // for testing
];
\`\`\`

#### Custom Event Handling

**Listen for form events:**
\`\`\`javascript
// Track form submissions
document.addEventListener('form-submit', (event) => {
  console.log('Form submitted:', event.detail);
  // Add analytics tracking
});

// Handle successful submissions
document.addEventListener('form-success', (event) => {
  console.log('Success:', event.detail);
  // Redirect to thank you page
  window.location.href = '/thank-you';
});

// Handle errors
document.addEventListener('form-error', (event) => {
  console.error('Error:', event.detail);
  // Show custom error message
});
\`\`\`

### Troubleshooting

#### Common Issues

**Form Not Submitting**
\`\`\`bash
# Check browser console for errors
# Verify API endpoint URL
# Confirm CORS settings
\`\`\`

**Leads Not Appearing**
- Verify DevLeads API is accessible
- Check API endpoint responds to POST requests
- Confirm database connection is working

**Email Notifications Not Sent**
- Verify email configuration in DevLeads
- Check spam folders
- Test email settings independently

**Styling Issues**
- Ensure CSS doesn't conflict with component styles
- Verify custom attributes and values are spelled and formatted correctly


#### Testing Checklist

- [ ] Form displays correctly on desktop
- [ ] Form displays correctly on mobile
- [ ] All required fields validate properly
- [ ] Form submits successfully
- [ ] Lead appears in DevLeads dashboard
- [ ] Email notifications are sent
- [ ] Custom styling applies correctly
- [ ] Error handling works properly

---

## 8. Email Notifications

Automatic email notifications for lead management and customer communication.

![Client email confirmation](../dashboard/assets/confirmation_emails/client_confirmation_email.png)

![Developer email confirmation](../dashboard/assets/confirmation_emails/developer_confirmation_email.png)

### Key Features

#### Notification Types
- **Admin Notifications**: New lead alerts for business owner
- **Customer Confirmations**: Automatic confirmation emails to leads

#### Email Templates
- **Professional Design**: Responsive email templates
- **Brand Customization**: Customizable colors and branding 
- **Dynamic Content**: Personalized with lead information
- **Call-to-Action**: Embedded links and contact information


### Email Types

1. **New Lead Notification** (to admin):
   - Immediate notification of new lead submissions
   - Complete lead information included
   - Professional formatting with lead details

2. **Lead Confirmation** (to customer):
   - Thank you message for inquiry submission
   - Summary of their request
   - Next steps and timeline information
   - Contact information for questions
   - Call to action

### Usage Guide

1. **Email Configuration**:
   - Configure SMTP settings in environment variables
   - Test email functionality with sample sends
   - Customize email templates in emailNotification.js
   - Set up email addresses for notifications

2. **Template Customization**:
   - Modify email styling and branding
   - Update business information and contact details
   - Customize call-to-action buttons and links
   - Test templates with sample data

---

## 5. Resources Page

Curated collection of developer tools, services, and resources organized by category.

![Business Resources](../dashboard/assets/devleads_features/resources.png)

### Resource Categories

#### Business Resources
Essential tools and services for running and managing your business operations, including scheduling software, proposal templates, project management platforms, e-signature solutions, payment processing, and productivity tools.

#### Design Resources
Creative tools and inspiration for visual design work, including graphic design platforms, color palette generators, interface design tools, icon libraries, typography resources, and UI/UX inspiration galleries.

#### Development Resources
Learning resources, documentation, and tools for software development, including learning, technical articles, template libraries, programming guides, reference documentation, and developer community platforms.

#### Tools & Utilities
Technical infrastructure and utility services for developers, including task automation, cloud platforms, version control, databases, API testing tools, and hosting solutions.

### Usage Guide

**Accessing Resources**:
- Navigate to Resources page from the sidebar
- Browse resources organized by category
- Click any resource link to visit the external website
- All resources open in new tabs/windows for convenience
- Resources are carefully curated for developers and small business owners

---

## 6. Settings Page

Customize application behavior and user preferences.

![Settings page](../dashboard/assets/devleads_features/settings_page.png)

### Key Features

#### Theme Settings
- **Interface Theme**: Light/dark theme toggle with system icons
- **Real-time Preview**: Theme changes apply immediately across the application
- **Persistent Storage**: Theme preference saved to user profile and localStorage

#### Date Format Settings  
- **Multiple Formats**: Choose from MM/DD/YYYY, DD/MM/YYYY, or YYYY-MM-DD
- **Live Example**: Real-time preview showing current date in selected format
- **Global Application**: Date format applies throughout the entire application
- **User Preference Storage**: Format preference saved in database

### Usage Guide

1. **Accessing Settings**:
   - Navigate to Settings from the sidebar
   - Settings page displays current preferences

2. **Theme Configuration**:
   - Click Light or Dark theme buttons in the Theme Settings section
   - Theme applies immediately system-wide
   - Choice is automatically saved

3. **Date Format Configuration**:
   - Click desired date format in the Date Format Settings section  
   - Example display updates to show current date in selected format
   - Format applies to dates throughout the application
   - Preference is automatically saved

---

## 9. Tips & Tricks

### Best Practices

#### Lead Management
- ⚠️ Regularly update lead statuses to maintain accurate pipeline
- Use consistent naming conventions for lead sources
- Maintain detailed notes for each lead interaction

#### Form Templates
- Keep templates updated with current business information
- Test generated documents before sending to clients
- Use clear, professional language in all templates
- Maintain consistent branding across all documents
- Carefully go through generated forms and edit for your use case

#### Financial Tracking
- Record payments immediately upon receipt
- Reconcile payment records with bank statements
- Maintain detailed records for tax and accounting purposes

#### Data Security
- Regularly backup your database
- Use strong passwords for all accounts
- Keep environment variables secure and private
- Monitor access logs for unusual activity


### Hidden Features

- From within DevLeads, try clicking the current page heading at the top quickly 7 times for a surprise 
---

This feature guide covers general functionality in the DevLeads application. Each feature is designed to work together to provide a complete lead and project management solution for freelance developers and small businesses.`,
  category: "other",
  isTemplate: true,
  variables: []
}
];

module.exports = formSeeds;